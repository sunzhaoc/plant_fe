import {useState, useEffect} from 'react';
import {ImageCache} from '/src/utils/imageCache';

/**
 * 带缓存的图片组件
 * @param {Object} props
 * @param {string} props.key - 图片唯一标识(建议使用植物ID+图片索引)
 * @param {string} props.url - 图片URL
 * @param {string} props.alt - 图片描述
 * @param {string} props.className - 样式类名
 */
export default function CachedImage({key, url, alt, className}) {
    const [src, setSrc] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImage = async () => {
            setLoading(true);
            try {
                const imageSrc = await ImageCache.getImageSrc(key, url);
                setSrc(imageSrc);
            } catch (error) {
                console.error('加载图片失败:', error);
                setSrc('/src/assets/images/default-plant.png');
            } finally {
                setLoading(false);
            }
        };

        loadImage();
    }, [key, url]);

    return (
        <div className={loading ? 'image-loading' : ''}>
            <img
                src={src}
                alt={alt}
                className={className}
                style={{
                    display: src ? 'block' : 'none',
                    // 加载中显示占位背景
                    backgroundColor: loading ? '#f5f5f5' : 'transparent'
                }}
            />
        </div>
    );
}