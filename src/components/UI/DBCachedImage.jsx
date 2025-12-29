import {useState, useEffect, useRef} from 'react';
import {ImageDbCache} from '/src/utils/imageDbCache';
import styles from '/src/components/UI/DBCachedImage.module.css';

/**
 * DBCachedImage 组件
 * 功能：
 * 1. 懒加载：仅在图片滚动到视口附近时才开始加载。
 * 2. 缓存控制：优先从 IndexedDB 本地数据库读取图片，减少网络请求。
 * 3. 占位图：在加载完成前显示 SVG 占位图。
 */
export default function DBCachedImage({url, params, alt, className}) {
    // 默认占位图（Base64 编码的灰度图片）
    const imgholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjwvc3ZnPg==';

    const [src, setSrc] = useState(imgholderSrc); // 图片源地址：初始为占位图
    const [loading, setLoading] = useState(true); // 资源是否正在处理/加载中
    const [isVisible, setIsVisible] = useState(false); // 关键状态：标记组件是否进入用户视口
    const containerRef = useRef(null); // 用于绑定 IntersectionObserver 的 DOM 容器引用

    /**
     * 逻辑 1：Intersection Observer（交叉观察器）
     * 用于检测组件是否出现在屏幕上
     */
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // 如果 entry.isIntersecting 为 true，表示组件进入了视口范围
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // 一旦图片可见并开始准备加载，就停止观察，释放资源
                    observer.disconnect();
                }
            },
            {
                // rootMargin: '100px' 表示提前 100 像素触发加载，提升用户滚动时的无感体验
                rootMargin: '100px',
                threshold: 0.01 // 只要 1% 的面积可见就触发
            }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        // 组件销毁时断开观察器
        return () => observer.disconnect();
    }, []);

    /**
     * 逻辑 2：图片加载逻辑
     * 仅在 isVisible 为 true（即组件已滚动到视口）时执行
     */
    useEffect(() => {
        let isMounted = true; // 防止内存泄漏：确保在组件卸载后不更新状态
        const loadImage = async () => {
            // 如果图片尚未进入视口，或者没有提供 URL，则保持占位状态
            if (!isVisible || !url) return;
            setLoading(true);
            try {
                // 调用 ImageDbCache 逻辑：
                // 1. 检查 IndexedDB 是否有此 URL 缓存
                // 2. 如果没有，则 fetch 下载并存入 IndexedDB
                // 3. 返回图片的 Blob URL
                const imageSrc = await ImageDbCache.getImageSrc(url + (params || ""));

                if (isMounted) {
                    setSrc(imageSrc); // 更新图片源，触发真实图片的显示
                }
            } catch (error) {
                console.error(`获取图片失败: ${url}`, error);
            } finally {
                if (isMounted) {
                    setLoading(false); // 加载流程结束
                }
            }
        };

        loadImage();

        // 清理函数
        return () => {
            isMounted = false;
            // 释放 URL 对象占用的内存。Blob URL 必须手动撤销
            if (src && src.startsWith('blob:')) {
                ImageDbCache.revokeObjectURL(src);
            }
        };
    }, [url, params, isVisible]); // 当 URL、参数或可见性改变时重新运行

    return (
        <div
            ref={containerRef} // 将容器绑定到观察器
            className={loading ? styles.plantCardImgLoading : styles.plantCardImgDone}
        >
            <img
                src={src}
                alt={alt}
                className={styles[className]}
                onLoad={() => setLoading(false)} // 图片完成渲染后的回调
                // 开启原生浏览器懒加载作为兜底保障
                loading="lazy"
            />
        </div>
    );
}