import QuantitySelector from 'src/components/UI/QuantitySelector';
import {useEffect, useState} from 'react';
import {plantImageApi} from 'src/services/api.tsx';
import styles from 'src/components/Cart/CartItem.module.css';

// 定义购物车商品项的类型
interface CartItemType {
    id: string | number;
    name: string;
    latinName: string;
    size: string;
    price: number;
    quantity: number;
    imgUrl: string;
}

// 定义 QuantitySelector 组件的 Props 类型
interface QuantitySelectorProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    size?: 'sm' | 'md' | 'lg'; // 支持尺寸类型，可根据实际需求扩展
}

// 重新定义 QuantitySelector 组件（如果原组件未定义类型，需补充类型）
// 注：如果项目中已有 QuantitySelector 独立文件，需将上述 Props 类型移至该文件
const TypedQuantitySelector: React.FC<QuantitySelectorProps> = (props) => {
    return <QuantitySelector {...props} />;
};

// 定义 CartItem 组件的 Props 类型
interface CartItemProps {
    item: CartItemType;
    onUpdate: (id: string | number, size: string, quantity: number) => void;
    onRemove: (id: string | number, size: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({item, onUpdate, onRemove}) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    const handleIncrease = () => {
        onUpdate(item.id, item.size, item.quantity + 1);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdate(item.id, item.size, item.quantity - 1);
        }
    };

    // 初始加载和原始路径变化时，获取有效 URL
    useEffect(() => {
        const fetchImage = async () => {
            if (!item.imgUrl) {
                setImageUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg==');
                return;
            }
            const validUrl = await plantImageApi.getPlantImage(item.imgUrl + '?image_process=resize,w_180');
            setImageUrl(validUrl);
        };
        fetchImage();
    }, [item.imgUrl]);

    // 图片加载失败时（可能 URL 过期），重新请求
    const handleImageError = async () => {
        const newUrl = await plantImageApi.getPlantImage(item.imgUrl + '?image_process=resize,w_180');
        setImageUrl(newUrl);
    };

    return (
        <div className={styles.cartItem}>
            {/* 桌面端布局 */}
            <div className={styles.desktopLayout}>
                {/* 图片 */}
                <div className={styles.desktopImageContainer}>
                    <img
                        src={imageUrl}
                        alt={item.name}
                        onError={handleImageError}
                        className={styles.itemImage}
                    />
                </div>

                {/* 文字区 */}
                <div className={styles.desktopTextArea}>
                    <h6 className={styles.itemName}>{item.name}</h6>
                    <p className={styles.latinName}>{item.latinName}</p>
                    <p className={styles.sizeText}>规格: {item.size}</p>
                </div>

                {/* 单价列 */}
                <div className={styles.priceColumn}>
                    <span className={styles.priceText}>¥ {item.price}</span>
                </div>

                {/* 数量选择器列 */}
                <div className={styles.quantityColumn}>
                    <TypedQuantitySelector
                        quantity={item.quantity}
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                        size="sm"
                    />
                </div>

                {/* 总价列 */}
                <div className={styles.totalColumn}>
                    <span className={styles.totalText}>¥ {(item.price * item.quantity).toFixed(2)}</span>
                </div>

                {/* 删除按钮 */}
                <div className={styles.deleteColumn}>
                    <button
                        className={styles.deleteButton}
                        onClick={() => onRemove(item.id, item.size)}
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            </div>

            {/* 移动端布局 */}
            <div className={styles.mobileLayout}>
                <div className="d-flex align-items-start">
                    {/* 图片 */}
                    <div className={styles.mobileImageContainer}>
                        <img
                            src={imageUrl}
                            alt={item.name}
                            onError={handleImageError}
                            className={`${styles.itemImage} ${styles.mobileImage}`}
                        />
                    </div>

                    {/* 主要信息 */}
                    <div className={styles.mobileInfoContainer}>
                        <h6 className={styles.itemName}>{item.name}</h6>
                        <p className={styles.latinName}>{item.latinName}</p>
                        <p className={styles.sizeText}>规格: {item.size}</p>
                        <div className={styles.mobilePriceQuantity}>
                            <span className={styles.priceText}>¥ {item.price}</span>
                            <TypedQuantitySelector
                                quantity={item.quantity}
                                onIncrease={handleIncrease}
                                onDecrease={handleDecrease}
                                size="sm"
                            />
                        </div>
                        <div className={styles.mobileSubtotalDelete}>
                            <span
                                className={styles.subtotalText}>小计: ¥ {(item.price * item.quantity).toFixed(2)}
                            </span>
                            <button
                                className={styles.deleteButton}
                                onClick={() => onRemove(item.id, item.size)}
                            >
                                <i className="bi bi-trash"></i> 删除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;