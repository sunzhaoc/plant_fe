import {useParams, Navigate, useLocation} from 'react-router-dom';
import PlantDetail from '/src/components/Plants/PlantDetail';
import api from "/src/utils/api.jsx";
import {useEffect, useState, useRef} from "react"; // 引入 useRef 用于优化依赖
import {useAuth} from '/src/context/AuthContext';
import {sleep} from '/src/utils/time.jsx';
import LoadingSpinner from "/src/utils/LoadingSpinner.jsx";

/**
 * 植物详情页容器组件
 * 负责：路由参数获取、数据请求、状态管理、错误处理及最终渲染分发
 */
export default function Detail() {
    // --- 1. Hooks 初始化 ---
    const {plantId} = useParams(); // 获取路由中的植物ID
    const location = useLocation(); // 获取当前路由位置对象（用于获取 state）

    // 从路由 state 中获取可能存在的预览数据（作为缓存/补充，不做主要数据源）
    // 使用 useRef 保存上一次的 mainPlantInfo，避免在依赖数组中引起不必要的重渲染
    const mainPlantInfoRef = useRef(location.state?.mainPlantInfo);

    // --- 2. 状态管理 ---
    const [plant, setPlant] = useState(null);       // 最终处理好的植物详情数据
    const [loading, setLoading] = useState(true);   // 加载中状态
    const [error, setError] = useState(null);       // 错误信息状态

    const {logout, setAuthModalOpen} = useAuth(); // 认证相关逻辑

    // --- 3. 工具函数：数据格式转换 ---
    /**
     * 将 API 返回的蛇形命名数据转换为前端驼峰命名，并构建核心数据结构
     * @param {object} rawData - API 原始返回数据
     * @returns {object} 转换后的标准数据结构
     */
    const transformPlantData = (rawData) => {
        if (!rawData) return {};

        // 安全解构：为可能不存在的字段提供默认值
        const {
            plant_name = '',
            plant_latin_name = '',
            plant_detail = '',
            images = [],
            skus = [],
            ...rest // 剩余字段透传
        } = rawData;

        // 字段映射：蛇形 -> 驼峰
        return {
            plantName: plant_name,
            plantLatinName: plant_latin_name,
            plantDetail: plant_detail,
            plantImages: images,
            plantSkus: skus,
            ...rest
        };
    };

    // --- 4. 副作用：数据获取 ---
    useEffect(() => {
        // 如果 plantId 不存在，直接终止
        if (!plantId) return;

        /**
         * 异步获取植物详情的核心逻辑
         */
        const fetchPlantDetail = async () => {
            try {
                setLoading(true);
                setError(null); // 重置错误状态

                // 发起 API 请求
                const response = await api.get(`/api/plant-detail/${plantId}`);
                const {success, message, data} = response?.data || {};

                // 人为延迟（可选）：通常用于避免 Loading 闪烁，让用户有感知过渡
                await sleep(300);

                // 业务逻辑错误处理
                if (!success) {
                    throw new Error(message || "获取植物详情数据失败");
                }

                // 数据清洗与转换
                const apiCoreData = transformPlantData(data);

                // 获取当前的缓存数据
                const cachedData = mainPlantInfoRef.current;

                // 数据合并策略：
                // 1. 先展开缓存数据（列表页带来的旧数据）
                // 2. 再展开 API 新数据（强制覆盖同名属性）
                // 目的：保留可能的额外字段，同时确保核心数据是最新的
                const finalPlantData = {
                    ...cachedData,
                    ...apiCoreData
                };

                setPlant(finalPlantData);

            } catch (err) {
                console.error("Detail Page Error:", err);

                // 401 权限处理：未登录或 Token 过期
                if (err.response?.status === 401) {
                    logout();
                    setAuthModalOpen(true);
                    setError("登录已过期，请重新登录");
                } else {
                    // 通用错误提示
                    setError(err.message || "网络异常，无法获取植物数据");
                }
            } finally {
                // 无论成功或失败，最终都关闭 loading
                setLoading(false);
            }
        };

        // 执行请求
        fetchPlantDetail();

        // 依赖项说明：
        // 仅依赖 plantId。只有当 ID 变化时才重新请求。
        // mainPlantInfo 被移入 useRef，避免了因引用变化导致的重复请求。
    }, [plantId, logout, setAuthModalOpen]);

    // --- 5. 渲染逻辑 ---

    // 状态 1: 加载中
    if (loading) {
        return <LoadingSpinner text="正在加载植物详情..." />;
    }

    // 状态 2: 发生错误
    if (error) {
        return <div className="error-container">{error}</div>;
    }

    // 状态 3: 数据为空 (兜底保护)
    if (!plant) {
        return <Navigate to="/" replace />;
    }

    // 状态 4: 正常渲染
    return <PlantDetail plant={plant} />;
}