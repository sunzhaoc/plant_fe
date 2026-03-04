import {plantImageApi} from "src/services/api.tsx";

// 缓存数据结构接口
interface ImageCacheItem {
    url: string;
    type: string;
    data: ArrayBuffer;
    expire: number;
    timestamp: number;
}

// 数据库配置
const DB_NAME = 'PlantImageCache';
const DB_VERSION = 1;
const STORE_NAME = 'images';
const INDEXED_DB_OPEN = false; // 是否打开 IndexedDB 数据库缓存

// 打开数据库连接
const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject('当前浏览器不支持 IndexedDB');
            return;
        }
        const request: IDBOpenDBRequest = indexedDB.open(DB_NAME, DB_VERSION);

        // 数据库升级/创建
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
            const target = event.target as IDBOpenDBRequest;
            if (!target.result) {
                reject(new Error('数据库实例获取失败'));
                return;
            }
            const db = target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // 创建存储对象，主键为url
                const store = db.createObjectStore(STORE_NAME, {keyPath: 'url'});
                // 创建过期时间索引，方便清理过期缓存
                store.createIndex('expireIndex', 'expire', {unique: false});
            }
        };

        request.onsuccess = (event: Event) => {
            const target = event.target as IDBOpenDBRequest;
            if (!target.result) {
                reject(new Error('数据库打开失败，无法获取实例'));
                return;
            }
            resolve(target.result);
        };

        request.onerror = (event: Event) => {
            const target = event.target as IDBOpenDBRequest;
            console.error('IndexedDB 打开失败:', target.error);
            reject(target.error);
        };

        request.onblocked = () => {
            reject(new Error('数据库被其他标签页占用，请关闭后重试'));
        };
    });
};

// 图片缓存工具类
export const ImageDbCache = {
    // 缓存有效期(7天，单位：毫秒)
    CACHE_EXPIRE: 7 * 24 * 60 * 60 * 1000,

    /**
     * 从缓存获取图片
     * @param {string} url - 图片唯一标识
     * @returns {Promise<Blob|null>} 图片Blob对象或null
     */
    async get(url: string): Promise<Blob | null> {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request: IDBRequest<ImageCacheItem | undefined> = store.get(url);

                request.onsuccess = () => {
                    const item = request.result;
                    if (!item) {
                        resolve(null);
                        return;
                    }
                    // 检查是否过期
                    if (Date.now() > item.expire) {
                        void this.remove(url); // 过期则删除
                        resolve(null);
                    } else {
                        // 将ArrayBuffer转换为Blob
                        const blob = new Blob([item.data], {type: item.type});
                        resolve(blob);
                    }
                };

                request.onerror = () => {
                    console.error('获取缓存失败:', request.error);
                    resolve(null);
                };

                transaction.oncomplete = () => {
                    db.close();
                };
            });
        } catch (error) {
            console.error('打开数据库失败:', error);
            return null;
        }
    },

    /**
     * 缓存图片
     * @param {string} url - 图片URL
     * @param {Blob} blob - 图片Blob对象
     */
    async set(url: string, blob: Blob): Promise<void> {
        // 入参校验
        if (!url || !(blob instanceof Blob)) {
            throw new Error('参数错误：url/blob不能为空，且blob必须是Blob对象');
        }
        let db: IDBDatabase | null = null;

        try {
            db = await openDB();
            // 封装FileReader为Promise，统一处理读取成功/失败
            const arrayBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    const result = e.target?.result;
                    if (!(result instanceof ArrayBuffer)) {
                        reject(new Error('Blob读取结果不是ArrayBuffer'));
                        return;
                    }
                    resolve(result);
                };
                reader.onerror = (e: ProgressEvent<FileReader>) => {
                    reject(new Error(`Blob读取失败: ${e.target?.error?.message || '未知错误'}`));
                };
                reader.readAsArrayBuffer(blob);
            });

            // 执行存储操作（显式控制事务生命周期）
            await new Promise<void>((resolve, reject) => {
                if (!db) {
                    reject(new Error('数据库实例不存在'));
                    return;
                }
                // 创建读写事务，显式指定存储库
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // 监听事务错误（关键：捕获put之外的事务级错误）
                transaction.onerror = (event: Event) => {
                    const target = event.target as IDBTransaction;
                    reject(new Error(`事务执行失败: ${target.error?.message || '未知错误'}`));
                };
                transaction.onabort = (event: Event) => {
                    const target = event.target as IDBTransaction;
                    reject(new Error(`事务被终止: ${target.error?.message || '未知错误'}`));
                };
                transaction.oncomplete = () => {
                    resolve();
                };

                // 执行put操作
                const request: IDBRequest<IDBValidKey> = store.put({
                    url,
                    type: blob.type,
                    data: arrayBuffer,
                    expire: Date.now() + this.CACHE_EXPIRE,
                    timestamp: Date.now()
                } satisfies ImageCacheItem);

                request.onsuccess = () => {
                    console.log(`缓存存储成功: ${url}`);
                };
                request.onerror = (event: Event) => {
                    const target = event.target as IDBRequest;
                    console.error('put操作具体错误:', {
                        message: target.error?.message,
                        code: target.error?.code,
                        name: target.error?.name,
                        url: url,
                        blobType: blob.type,
                        arrayBuffer: arrayBuffer?.byteLength
                    });
                    reject(new Error(`put操作失败: ${target.error?.message || '未知错误'}`));
                };
            });
        } catch (error) {
            console.error('缓存图片失败:', error);
            throw error; // 抛出错误，让调用方感知
        } finally {
            // 无论成功失败，关闭数据库连接（释放锁）
            if (db) {
                db.close();
            }
        }
    },

    /**
     * 移除指定缓存
     * @param {string} url - 图片唯一标识
     */
    async remove(url: string): Promise<void> {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                // 修正类型：delete 操作返回的 IDBRequest result 类型为 undefined
                const request: IDBRequest<undefined> = store.delete(url);

                request.onsuccess = () => resolve();
                request.onerror = () => {
                    console.error('删除缓存失败:', request.error);
                    resolve();
                };
                transaction.oncomplete = () => {
                    db.close();
                };
            });
        } catch (error) {
            console.error('打开数据库失败:', error);
        }
    },

    /**
     * 清理所有过期缓存
     */
    async cleanExpired(): Promise<void> {
        try {
            const db = await openDB();
            return new Promise((resolve) => {
                const now = Date.now();
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const index = store.index('expireIndex');
                const request: IDBRequest<IDBCursorWithValue | null> = index.openCursor(IDBKeyRange.upperBound(now));
                const deletions: Promise<void>[] = [];

                request.onsuccess = (event: Event) => {
                    const target = event.target as IDBRequest<IDBCursorWithValue | null>;
                    const cursor = target.result;
                    if (cursor) {
                        // 把IDBRequest包装为Promise，解决原逻辑Promise.all执行异常问题
                        const deletePromise = new Promise<void>((res, rej) => {
                            const deleteReq: IDBRequest<undefined> = cursor.delete();
                            deleteReq.onsuccess = () => res();
                            deleteReq.onerror = () => rej(deleteReq.error);
                        });
                        deletions.push(deletePromise);
                        cursor.continue();
                    } else {
                        // 所有删除操作完成后resolve
                        Promise.all(deletions)
                            .then(() => resolve())
                            .catch((err) => {
                                console.error('清理过期缓存失败:', err);
                                resolve();
                            });
                    }
                };

                request.onerror = () => {
                    console.error('清理过期缓存失败:', request.error);
                    resolve();
                };

                transaction.oncomplete = () => {
                    db.close();
                };
            });
        } catch (error) {
            console.error('打开数据库失败:', error);
        }
    },

    /**
     * 获取图片并缓存
     * @param {string} url - 图片唯一标识
     * @returns {Promise<string>} 可用于img标签的src
     */
    async getImageSrc(url: string): Promise<string> {
        if (INDEXED_DB_OPEN) {
            // 先清理过期缓存
            await this.cleanExpired();
            // 检查缓存
            const cachedBlob = await this.get(url);
            if (cachedBlob) {
                console.log(`命中本地缓存: ${url}`);
                return URL.createObjectURL(cachedBlob);
            }
        }

        // 缓存不存在，请求网络
        try {
            const signedURL = await plantImageApi.getPlantImage(url);
            if (typeof signedURL !== 'string' || !signedURL) {
                throw new Error(`signedURL 无效：${signedURL}`); // 提前拦截无效值
            }

            if (INDEXED_DB_OPEN) {
                const response = await fetch(signedURL, {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'omit',
                });
                if (!response.ok) {
                    throw new Error(`图片请求失败: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                await this.set(url, blob);
                return URL.createObjectURL(blob);
            }
            return signedURL;
        } catch (error) {
            console.error(`获取图片失败: ${url}`, error);
            return '/src/assets/images/default-plant.jpg';
        }
    },

    /**
     * 释放Blob URL资源
     * @param {string} url - 通过URL.createObjectURL创建的URL
     */
    revokeObjectURL(url: string): void {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    }
};