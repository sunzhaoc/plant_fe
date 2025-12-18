/**
 * IndexedDB 封装工具 - 用于存储图片二进制数据
 * 优势：大容量（数百MB/GB）、支持二进制存储、异步操作
 */
class ImageDB {
    constructor() {
        this.DB_NAME = 'PlantImageCacheDB'; // 数据库名
        this.DB_VERSION = 1; // 版本号
        this.STORE_NAME = 'imageCacheStore'; // 存储对象仓库名
        this.db = null; // 数据库实例
    }

    /**
     * 初始化数据库连接
     * @returns {Promise<IDBDatabase>} 数据库实例
     */
    init() {
        return new Promise((resolve, reject) => {
            // 关闭已有连接（避免重复初始化）
            if (this.db) {
                this.db.close();
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            // 数据库首次创建/版本升级时触发
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // 创建对象仓库：以原始URL为主键，添加timestamp索引（用于清理旧缓存）
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'originalUrl' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('expire', 'expire', { unique: false });
                    console.log('[ImageDB] 数据库仓库创建成功');
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                console.log('[ImageDB] 数据库连接成功');
                resolve(this.db);
            };

            request.onerror = (e) => {
                console.error('[ImageDB] 数据库连接失败:', e.target.error);
                reject(e.target.error);
            };

            request.onblocked = () => {
                console.warn('[ImageDB] 数据库操作被阻塞，请关闭其他标签页重试');
                reject(new Error('数据库操作被阻塞'));
            };
        });
    }

    /**
     * 存储图片缓存
     * @param {string} originalUrl 原始URL（唯一标识）
     * @param {Blob} blob 图片二进制数据
     * @param {number} expire 过期时间戳（ms）
     * @returns {Promise<void>}
     */
    put(originalUrl, blob, expire) {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();

            const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const cacheData = {
                originalUrl,
                blob, // 直接存储二进制Blob（IndexedDB原生支持）
                expire, // 过期时间戳
                timestamp: Date.now(), // 存储时间戳（用于LRU清理）
                updateTime: Date.now() // 最后访问时间
            };

            const request = store.put(cacheData); // 存在则更新，不存在则新增

            request.onsuccess = () => {
                console.log(`[ImageDB] 图片缓存存储成功: ${originalUrl}`);
                resolve();
            };

            request.onerror = (e) => {
                console.error(`[ImageDB] 图片缓存存储失败 [${originalUrl}]:`, e.target.error);
                reject(e.target.error);
            };
        });
    }

    /**
     * 获取图片缓存
     * @param {string} originalUrl 原始URL
     * @returns {Promise<{blob: Blob, expire: number}|null>} 缓存数据（null表示无/过期）
     */
    get(originalUrl) {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();

            const transaction = this.db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(originalUrl);

            request.onsuccess = (e) => {
                const cacheData = e.target.result;
                if (!cacheData) {
                    console.log(`[ImageDB] 缓存未命中: ${originalUrl}`);
                    resolve(null);
                    return;
                }

                // 检查是否过期
                if (Date.now() > cacheData.expire) {
                    console.log(`[ImageDB] 缓存已过期: ${originalUrl} (过期时间: ${new Date(cacheData.expire).toLocaleString()})`);
                    this.delete(originalUrl); // 主动删除过期缓存
                    resolve(null);
                    return;
                }

                // 更新最后访问时间（用于LRU）
                this.updateAccessTime(originalUrl);
                console.log(`[ImageDB] 缓存命中: ${originalUrl}`);
                resolve({
                    blob: cacheData.blob,
                    expire: cacheData.expire
                });
            };

            request.onerror = (e) => {
                console.error(`[ImageDB] 获取缓存失败 [${originalUrl}]:`, e.target.error);
                reject(e.target.error);
            };
        });
    }

    /**
     * 删除指定缓存
     * @param {string} originalUrl 原始URL
     * @returns {Promise<void>}
     */
    delete(originalUrl) {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();

            const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(originalUrl);

            request.onsuccess = () => {
                console.log(`[ImageDB] 缓存已删除: ${originalUrl}`);
                resolve();
            };

            request.onerror = (e) => {
                console.error(`[ImageDB] 删除缓存失败 [${originalUrl}]:`, e.target.error);
                reject(e.target.error);
            };
        });
    }

    /**
     * 更新最后访问时间（用于LRU清理）
     * @param {string} originalUrl 原始URL
     */
    updateAccessTime(originalUrl) {
        this.get(originalUrl).then(cacheData => {
            if (cacheData) {
                this.put(originalUrl, cacheData.blob, cacheData.expire); // 复用put更新时间戳
            }
        }).catch(err => {
            console.error(`[ImageDB] 更新访问时间失败 [${originalUrl}]:`, err);
        });
    }

    /**
     * 清理所有过期缓存
     * @returns {Promise<number>} 清理的缓存数量
     */
    cleanExpired() {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();

            const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('expire');
            const now = Date.now();
            let deletedCount = 0;

            // 遍历所有过期的缓存
            const request = index.openCursor(IDBKeyRange.upperBound(now));
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cursor.delete();
                    deletedCount++;
                    console.log(`[ImageDB] 清理过期缓存: ${cursor.value.originalUrl}`);
                    cursor.continue();
                } else {
                    console.log(`[ImageDB] 过期缓存清理完成，共清理 ${deletedCount} 项`);
                    resolve(deletedCount);
                }
            };

            request.onerror = (e) => {
                console.error('[ImageDB] 清理过期缓存失败:', e.target.error);
                reject(e.target.error);
            };
        });
    }

    /**
     * LRU清理：当缓存数量超过阈值时，删除最久未访问的缓存
     * @param {number} maxCount 最大缓存数量（默认100）
     * @returns {Promise<number>} 清理的缓存数量
     */
    cleanLRU(maxCount = 100) {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();

            const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
            const store = transaction.objectStore(this.STORE_NAME);
            const index = store.index('timestamp'); // 按存储时间戳排序（也可改用updateTime）
            const cacheList = [];
            let deletedCount = 0;

            // 收集所有缓存项
            const cursorRequest = index.openCursor();
            cursorRequest.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    cacheList.push(cursor.value);
                    cursor.continue();
                } else {
                    // 若超过最大数量，删除最旧的
                    if (cacheList.length > maxCount) {
                        const needDelete = cacheList.slice(0, cacheList.length - maxCount);
                        needDelete.forEach(item => {
                            store.delete(item.originalUrl);
                            deletedCount++;
                            console.log(`[ImageDB] LRU清理: ${item.originalUrl} (存储时间: ${new Date(item.timestamp).toLocaleString()})`);
                        });
                    }
                    console.log(`[ImageDB] LRU清理完成，共清理 ${deletedCount} 项，剩余 ${cacheList.length - deletedCount} 项`);
                    resolve(deletedCount);
                }
            };

            cursorRequest.onerror = (e) => {
                console.error('[ImageDB] LRU清理失败:', e.target.error);
                reject(e.target.error);
            };
        });
    }

    /**
     * 获取缓存总数
     * @returns {Promise<number>} 缓存数量
     */
    getCacheCount() {
        return new Promise(async (resolve, reject) => {
            if (!this.db) await this.init();

            const transaction = this.db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.count();

            request.onsuccess = (e) => {
                resolve(e.target.result);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });
    }

    /**
     * 关闭数据库连接
     */
    close() {
        if (this.db) {
            this.db.close();
            console.log('[ImageDB] 数据库连接已关闭');
        }
    }
}

// 导出单例实例（避免重复初始化）
export const imageDB = new ImageDB();