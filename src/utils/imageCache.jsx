// 图片缓存工具类
export const ImageCache = {
    // 缓存前缀
    CACHE_PREFIX: 'plant_image_',
    // 缓存有效期(7天，单位：毫秒)
    CACHE_EXPIRE: 7 * 24 * 60 * 60 * 1000,

    /**
     * 从缓存获取图片
     * @param {string} key - 图片唯一标识
     * @returns {object|null} 缓存的图片信息 { url, blob, expire }
     */
    get: (key) => {
        try {
            const cacheKey = `${ImageCache.CACHE_PREFIX}${key}`;
            const item = localStorage.getItem(cacheKey);
            if (!item) return null;

            const parsed = JSON.parse(item);
            // 检查是否过期
            if (Date.now() > parsed.expire) {
                ImageCache.remove(key);
                return null;
            }
            return parsed;
        } catch (error) {
            console.error('获取图片缓存失败:', error);
            return null;
        }
    },

    /**
     * 缓存图片
     * @param {string} key - 图片唯一标识
     * @param {string} url - 图片URL
     * @param {Blob} blob - 图片二进制数据
     */
    set: async (key, url, blob) => {
        try {
            const cacheKey = `${ImageCache.CACHE_PREFIX}${key}`;
            // 转换blob为base64以便存储
            const base64 = await ImageCache.blobToBase64(blob);

            localStorage.setItem(cacheKey, JSON.stringify({
                url,
                base64,
                expire: Date.now() + ImageCache.CACHE_EXPIRE
            }));
        } catch (error) {
            console.error('存储图片缓存失败:', error);
        }
    },

    /**
     * 移除缓存
     * @param {string} key - 图片唯一标识
     */
    remove: (key) => {
        const cacheKey = `${ImageCache.CACHE_PREFIX}${key}`;
        localStorage.removeItem(cacheKey);
    },

    /**
     * 清理所有过期缓存
     */
    cleanExpired: () => {
        const now = Date.now();
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(ImageCache.CACHE_PREFIX)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (now > item.expire) {
                        localStorage.removeItem(key);
                    }
                } catch (error) {
                    localStorage.removeItem(key);
                }
            }
        });
    },

    /**
     * Blob转Base64
     * @param {Blob} blob
     * @returns {Promise<string>} base64字符串
     */
    blobToBase64: (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * 获取图片并缓存
     * @param {string} key - 图片唯一标识
     * @param {string} url - 图片URL
     * @returns {Promise<string>} 可用于img标签的src
     */
    getImageSrc: async (key, url) => {
        // 先清理过期缓存
        ImageCache.cleanExpired();

        // 检查缓存
        const cache = ImageCache.get(key);
        if (cache) {
            // 缓存未过期，直接使用
            return cache.base64;
        }

        // 缓存过期或不存在，重新获取
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('图片请求失败');

            const blob = await response.blob();
            // 缓存新图片
            await ImageCache.set(key, url, blob);
            // 转换为base64返回
            return await ImageCache.blobToBase64(blob);
        } catch (error) {
            console.error('获取图片失败:', error);
            // 如果有缓存但过期了，失败时可以临时使用过期缓存
            if (cache?.base64) {
                console.warn('使用过期缓存图片');
                return cache.base64;
            }
            // 返回默认图片
            return '/src/assets/images/default-plant.png';
        }
    }
};