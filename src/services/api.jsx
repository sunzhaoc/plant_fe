import api from '/src/utils/api';
import md5 from 'md5';

export const plantApi = {
    imageCache: {},
    getPlantImage: async (imgUrl) => {
        if (!imgUrl) return '/src/assets/images/default-plant.jpg';
        const cache = plantApi.imageCache[imgUrl];
        if (cache && Date.now() < cache.expire) {
            console.log('缓存命中：', imgUrl);
            return cache.url; // 返回缓存有效的 URL
        }

        // 缓存无效，不存在
        try {
            const response = await api.get('/api/plant-image', {
                params: {imgUrl},
            });
            const data = response.data;
            if (!data?.url) {
                throw new Error('返回数据无图片链接');
            }
            // console.log('图片链接：', data.url);
            plantApi.imageCache[imgUrl] = {
                url: data.url,
                expire: Date.now() + 15 * 60 * 1000, // 缓存5分钟
            };
            return data.url;
        } catch (error) {
            console.error('图片请求错误：', error);
            return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg==';
        }
    }
}

export const plantImageApi = {
    /**
     * 生成阿里云 CDN A 类鉴权 URL
     * @param {string} url - 原始路径 (例如: /test.jpg 或 test.jpg?x-oss-process=...)
     * @param {number} [validSeconds=3600] - 有效期（秒），默认 1 小时
     */
    getPlantImage: (url, validSeconds = 3600) => {
        const CONFIG = {
            domain: 'image.antplant.store',
            authKey: 'sunzhaochuan',
            uid: '0',
            rand: '0'
        };

        if (!url) return '';

        // 1. 处理路径与参数
        const [pathPart, queryPart] = url.split('?');
        const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;

        // 2. 计算过期时间戳 (当前时间 + 有效时长)
        const timestamp = Math.floor(Date.now() / 1000) + validSeconds;

        // 3. 构造签名字符串并计算 MD5
        // 格式: /URI-Timestamp-rand-uid-PrivateKey
        const signStr = `${path}-${timestamp}-${CONFIG.rand}-${CONFIG.uid}-${CONFIG.authKey}`;
        const hash = md5(signStr);

        // 4. 拼接最终 URL
        const authKeyParam = `auth_key=${timestamp}-${CONFIG.rand}-${CONFIG.uid}-${hash}`;
        const connector = queryPart ? `?${queryPart}&` : '?';

        return `https://${CONFIG.domain}${path}${connector}${authKeyParam}`;
    }
};