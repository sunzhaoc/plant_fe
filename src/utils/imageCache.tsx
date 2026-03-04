// import {imageDB} from 'src/utils/indexedDb'; // 修复文件名大小写不一致问题
// import {plantApi} from 'src/services/api';
//
// // 定义缓存数据类型接口
// interface CacheData {
//     blob: Blob;
//     expireTime: number;
//
//     [key: string]: any; // 兼容其他扩展属性
// }
//
// // 补充imageDB的TypeScript类型声明（若全局类型未定义）
// // declare const imageDB: {
// //     cleanExpired: () => Promise<void>;
// //     get: (key: string) => Promise<CacheData | null>;
// //     put: (key: string, blob: Blob, expireTime: number) => Promise<void>;
// //     cleanLRU: (maxCount: number) => Promise<void>;
// //     delete: (key: string) => Promise<void>;
// //     getCacheCount: () => Promise<number>;
// //     init: () => Promise<IDBDatabase>;
// //     STORE_NAME: string; // 定义STORE_NAME静态属性
// // };
//
// /**
//  * 图片缓存核心工具类
//  * 核心逻辑：
//  * 1. 首次加载：请求后端→获取OSS临时URL→加载图片→存入IndexedDB
//  * 2. 后续加载：直接从IndexedDB读取→无OSS请求
//  * 3. 缓存有效期：23小时（小于OSS临时URL有效期，如24小时）
//  */
// export const ImageCache = {
//     // 缓存有效期（23小时，单位ms）
//     CACHE_EXPIRE: 23 * 60 * 60 * 1000,
//     // 最大缓存数量（LRU阈值）
//     MAX_CACHE_COUNT: 100,
//
//     /**
//      * Blob转Base64（用于img标签src）
//      * @param {Blob} blob 图片二进制数据
//      * @returns {Promise<string>} Base64字符串
//      */
//     blobToBase64: (blob: Blob): Promise<string> => { // 修复参数隐式any
//         return new Promise((resolve, reject) => {
//             const reader = new FileReader();
//             reader.onloadend = () => resolve(reader.result as string);
//             reader.onerror = reject;
//             reader.readAsDataURL(blob);
//         });
//     },
//
//     /**
//      * 核心方法：获取图片Src（优先本地缓存）
//      * @param {string} originalUrl 原始图片URL（唯一标识）
//      * @returns {Promise<string>} 可直接用于img标签的src
//      */
//     getImageSrc: async (originalUrl: string): Promise<string> => { // 修复参数隐式any
//         console.log(`[CachedImage] getImageSrc: ${originalUrl}`);
//         // 前置检查：空URL返回默认图
//         if (!originalUrl || originalUrl.trim() === '') {
//             console.log('[ImageCache] 空URL，返回默认图');
//             return '/src/assets/images/default-plant.png';
//         }
//
//         try {
//             // 1. 清理过期缓存（每次获取前执行，保证缓存有效性）
//             await imageDB.cleanExpired();
//             // 2. 检查本地缓存（添加类型断言）
//             const cacheData = await imageDB.get(originalUrl) as CacheData | null;
//             if (cacheData) {
//                 // 缓存命中：直接转Base64返回（无OSS请求）
//                 const base64 = await ImageCache.blobToBase64(cacheData.blob);
//                 console.log(`[ImageCache] 缓存命中，返回本地图片: ${originalUrl}`);
//                 return base64;
//             }
//
//             // 3. 缓存未命中：调用正确的plantApi方法（修复post不存在问题）
//             console.log(`[ImageCache] 缓存未命中，请求后端获取临时URL: ${originalUrl}`);
//             // 替换post为getPlantImage（匹配plantApi的实际方法）
//             const response = await plantApi.getPlantImage(originalUrl);
//
//             // 校验后端返回（参考原api.jsx的返回格式）
//             if (!response || !response.data || !response.data.success) {
//                 throw new Error(`后端接口返回异常: ${response?.data?.message || '未知错误'}`);
//             }
//
//             const tempUrl = response.data.data.tempUrl; // 后端返回的OSS临时URL
//             console.log(`[ImageCache] 后端返回临时URL: ${tempUrl}`);
//
//             // 4. 通过临时URL加载OSS图片（仅这一次请求OSS）
//             console.log(`[ImageCache] 开始请求OSS加载图片: ${tempUrl}`);
//             const ossResponse = await fetch(tempUrl, {
//                 method: 'GET',
//                 mode: 'cors', // 适配OSS跨域
//                 cache: 'no-store' // 禁用浏览器网络缓存（确保每次都从OSS拉最新，但本地会缓存）
//             });
//
//             if (!ossResponse.ok) {
//                 throw new Error(`OSS请求失败，状态码: ${ossResponse.status}，URL: ${tempUrl}`);
//             }
//
//             // 5. 转换为Blob（二进制）
//             const blob = await ossResponse.blob();
//             console.log(`[ImageCache] OSS图片加载成功，大小: ${(blob.size / 1024).toFixed(2)}KB`);
//
//             // 6. 存入IndexedDB（持久化缓存）
//             const expireTime = Date.now() + ImageCache.CACHE_EXPIRE;
//             await imageDB.put(originalUrl, blob, expireTime);
//             // 7. LRU清理（防止缓存过多）
//             await imageDB.cleanLRU(ImageCache.MAX_CACHE_COUNT);
//
//             // 8. 转Base64返回
//             const base64 = await ImageCache.blobToBase64(blob);
//             console.log(`[ImageCache] 图片缓存完成，返回Base64: ${originalUrl}`);
//             return base64;
//
//         } catch (error) {
//             // 异常处理：打印详细日志，返回默认图
//             console.error(`[ImageCache] 获取图片失败 [${originalUrl}]:`, error);
//             return '/src/assets/images/default-plant.png';
//         }
//     },
//
//     /**
//      * 手动删除指定图片缓存
//      * @param {string} originalUrl 原始URL
//      */
//     removeCache: async (originalUrl: string): Promise<void> => { // 修复参数隐式any
//         await imageDB.delete(originalUrl);
//     },
//
//     /**
//      * 清空所有图片缓存
//      */
//     clearAllCache: async (): Promise<void> => {
//         // 遍历所有缓存项并删除（简化实现，也可直接删除数据库）
//         const count = await imageDB.getCacheCount();
//         if (count === 0) {
//             console.log('[ImageCache] 无缓存可清空');
//             return;
//         }
//         // 注：若需批量清空，可扩展IndexedDB的clear方法
//         console.warn(`[ImageCache] 清空所有缓存（共${count}项）`);
//         // 修复db未知类型问题：添加类型断言
//         const db = await imageDB.init() as IDBDatabase;
//         const transaction = db.transaction(imageDB.STORE_NAME, 'readwrite'); // 修复STORE_NAME访问
//         const store = transaction.objectStore(imageDB.STORE_NAME);
//         store.clear();
//     }
// };