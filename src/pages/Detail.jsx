import {useParams, Navigate, useLocation} from 'react-router-dom';
import PlantDetail from '/src/components/Plants/PlantDetail';
import api from "/src/utils/api.jsx";
import {useEffect, useState} from "react";
import {useAuth} from '/src/context/AuthContext';

export default function Detail() {
    const {plantId} = useParams();  // 从路由参数获取plantId
    const location = useLocation();  // 获取路由位置信息
    const {mainPlantInfo} = location.state || {};  // 安全获取mainPlantInfo（plant主表的数据）
    const [plant, setPlant] = useState(null); // 存储植物详情数据
    const [loading, setLoading] = useState(true); // 加载状态标记
    const [error, setError] = useState(null); // 错误信息存储
    const {logout, setAuthModalOpen} = useAuth();

    useEffect(() => {
        const fetchPlantDetail = async () => {
            try {
                setLoading(true);
                const {data: {success, message, data}} = await api.get(`/api/plant-detail/${plantId}`);

                if (!success) throw new Error(message || "获取植物详情数据失败");

                const {images: plantImages, skus: plantSkus, ...restData} = data;

                setPlant({
                    ...mainPlantInfo,
                    ...restData,
                    plantImages,
                    plantSkus
                });
            } catch (err) {
                if (err.response?.status === 401) {
                    logout();
                    setAuthModalOpen(true);
                }
                setError(err.message || "网络异常，无法获取植物数据");
                console.error(err.message || '网络异常，请稍后重试');
            } finally {
                setLoading(false);
            }
        };

        // 调用异步请求函数
        fetchPlantDetail();
    }, [plantId]); // 依赖项：plantId变化时重新请求

    if (loading) {
        return <div>正在加载植物详情...</div>; // 可替换为自定义加载组件
    }

    // 错误状态渲染
    if (error) {
        return <div>{error}</div>; // 可替换为自定义错误组件
    }

    if (!plant) {
        return <Navigate to="/" replace />;
    }
    return <PlantDetail plant={plant} />;
}