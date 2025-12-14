import api from '/src/utils/api';

export const plantApi = {
    getPlantImage: async (imgUrl) => {
        try {
            const response = await api.get('/api/plant-image', {
                params: {imgUrl},
            });
            const data = response.data;
            if (!data?.url) {
                throw new Error('返回数据无图片链接');
            }
            console.log('图片链接：', data.url);
            return data.url;
        } catch (error) {
            console.error('图片请求错误：', error);
            return '/placeholder-image.png'; // 占位图
        }
    }
}