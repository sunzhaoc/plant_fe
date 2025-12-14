export const plantApi = {
    getPlantImage: async (imgUrl) => {
        try {
            const response = await fetch(`http://localhost:8080/api/plant-image?imgUrl=${imgUrl}`);
            if (!response.ok) throw new Error("获取图片失败");
            const data = await response.json();
            console.log(data.url);
            return data.url;

        } catch (error) {
            console.error('图片请求错误：', error);
            return '/placeholder-image.png'; // 占位图
        }
    }
}