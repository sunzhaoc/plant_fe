import {useState, useEffect} from 'react';
import {ImageDbCache} from '/src/utils/imageDbCache';
import styles from '/src/components/UI/DBCachedImage.module.css';


/**
 * 基于IndexedDB的图片缓存组件
 * @param {Object} props
 * @param {string} props.url - 图片URL
 * @param {string} props.alt - 图片描述
 * @param {string} props.className - 样式类名
 */
export default function DBCachedImage({url, alt, className}) {
    const [src, setSrc] = useState(''); // 最终渲染的图片地址（IndexedDB缓存的图片->远程图片->占位图片）
    const [loading, setLoading] = useState(true); // 标记图片是否处于加载状态
    useEffect(() => {
        let isMounted = true; // 防内存泄漏标记（初始为 true，组件卸载时为 false）
        const loadImage = async () => {
            setLoading(true);
            try {
                const imageSrc = await ImageDbCache.getImageSrc(url);
                if (isMounted) {
                    setSrc(imageSrc);
                }
            } catch (error) {
                console.error(`获取图片失败: ${url}`, error);
                if (isMounted) {
                    setSrc('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg==');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        if (url === undefined) {
            setSrc('/src/assets/images/default-plant.jpg');
        } else {
            loadImage().then(() => {
            });
        }
        // 组件卸载时释放Blob URL
        return () => {
            isMounted = false;
            if (src) {
                ImageDbCache.revokeObjectURL(src);
            }
        };
    }, [url]);

    return (<div className={loading ? styles.plantCardImgLoading : styles.plantCardImgDone}>
        <img
            src={src}
            alt={alt}
            className={styles[className]}
            // style={{
            //     display: src ? 'block' : 'none', backgroundColor: loading ? '#f5f5f5' : 'transparent'
            // }}
            onLoad={() => setLoading(false)}
        />
    </div>);
}