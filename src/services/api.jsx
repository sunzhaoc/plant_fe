import api from '/src/utils/api';

export const plantApi = {
    imageCache: {},
    getPlantImage: async (imgUrl) => {
        if (!imgUrl) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg==';
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
            console.log('图片链接：', data.url);
            plantApi.imageCache[imgUrl] = {
                url: data.url,
                expire: Date.now() + 15 * 60 * 1000, // 缓存5分钟
            };
            return data.url;
        } catch (error) {
            console.error('图片请求错误：', error);
            return '/placeholder-image.png'; // 占位图
        }
    }
}