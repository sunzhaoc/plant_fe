import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ImageGallery from '/src/components/UI/ImageGallery';
import QuantitySelector from '/src/components/UI/QuantitySelector';
import {useCart} from '/src/context/CartContext';
import styles from '/src/components/Plants/PlantDetail.module.css';
import toast from 'react-hot-toast';

export default function PlantDetail({plant}) {
    const [selectedSize, setSelectedSize] = useState(plant.sizes[0]);
    const [quantity, setQuantity] = useState(1);

    const {addToCart} = useCart();
    const navigate = useNavigate();

    const handleIncrease = () => setQuantity(prev => prev + 1);
    const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));

    const handleAddToCart = () => {
        addToCart(
            {...plant, price: selectedSize.price},
            selectedSize.size,
            quantity
        );
        toast.success('已添加到购物车');
    };

    const handleViewCart = () => {
        navigate('/cart');
    };

    const handleSizeChange = (sizeItem) => {
        setSelectedSize(sizeItem);
    }


    return (
        <div className={styles.plantDetailContainer}>
            {/* 上半部分：图片与购买信息 */}
            <div className={styles.plantMainSection}>

                {/* 左侧：图片展示 */}
                <div className={styles.plantGalleryCol}>
                    {/* 确保 ImageGallery 内部样式也尽量简洁，不要有太厚的边框 */}
                    <ImageGallery imgUrls={plant.imgUrl} />
                </div>

                {/* 右侧：信息面板 */}
                <div className={styles.plantInfoCol}>
                    <header>
                        <h1 className={styles.plantTitle}>{plant.name}</h1>
                        <p className={styles.plantLatin}>{plant.latinName}</p>
                        <div className={styles.plantPrice}>¥ {selectedSize.price}</div>
                    </header>

                    <div className="mb-4">
                        <span className={styles.sectionLabel}>选择规格</span>
                        <div className="d-flex flex-wrap">
                            {plant.sizes.map(_ => (
                                <button
                                    key={_.size}
                                    className={`${styles.sizeBtn} ${selectedSize.size === _.size ? styles.active : ''}`}
                                    onClick={() => handleSizeChange(_)}
                                >
                                    {_.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <span className={styles.sectionLabel}>购买数量</span>
                        {/* 确保 QuantitySelector 样式也是扁平的，去掉了圆角 */}
                        <QuantitySelector
                            quantity={quantity}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={styles.btnFlatPrimary}
                            onClick={handleAddToCart}
                        >
                            加入购物车
                        </button>
                        <button
                            className={styles.btnFlatOutline}
                            onClick={handleViewCart}
                        >
                            <i className="bi bi-bag me-2"></i>
                            查看
                        </button>
                    </div>
                </div>
            </div>

            {/* 下半部分：商品介绍 (放在最下面) */}
            <div className={styles.plantDescriptionSection}>
                <h4 className={styles.descTitle}>关于植物</h4>
                <p className={styles.descText}>
                    {plant.name}（{plant.latinName}）。
                    <br /><br />
                    这是一种独特的蚁栖植物，与蚂蚁形成共生关系。其独特的形态结构不仅具有极高的观赏价值，
                    更是自然界共生智慧的体现。适合室内散射光环境栽培，耐旱性较强，易于养护。
                    无论是放置于极简风格的客厅，还是作为书桌上的点缀，它都能为空间带来一丝静谧的自然气息。
                </p>
            </div>
        </div>
    );
}