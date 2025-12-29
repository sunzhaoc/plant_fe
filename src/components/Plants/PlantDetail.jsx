import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ImageGallery from '/src/components/UI/ImageGallery';
import QuantitySelector from '/src/components/UI/QuantitySelector';
import {useCart} from '/src/context/CartContext';
import styles from '/src/components/Plants/PlantDetail.module.css';
import toast from 'react-hot-toast';

export default function PlantDetail({plant}) {
    // 默认选中第一个有库存的规格
    const defaultSize = plant?.plantSkus?.find(_ => _.stock > 0) || plant?.plantSkus?.[0] || null;
    const [selectedSize, setSelectedSize] = useState(defaultSize);
    const [quantity, setQuantity] = useState(1);

    const {addToCart} = useCart();
    const navigate = useNavigate();

    // 数量增减（限制最大购买数量为选中规格的库存）
    const handleIncrease = () => {
        if (selectedSize && quantity < selectedSize.stock) {
            setQuantity(prev => prev + 1);
        }
    };

    const handleDecrease = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    // 加入购物车（增加库存校验）
    const handleAddToCart = () => {
        if (!plant || !selectedSize) {
            toast.error('请选择有效的商品规格');
            return;
        }
        addToCart(
            {
                plantId: plant.plantId,
                plantName: plant.plantName,
                plantLatinName: plant.plantLatinName,
                plantMainImgUrl: plant.plantMainImgUrl,
                plantSku: selectedSize.size,
                plantPrice: selectedSize.price,
                plantQuantity: quantity
            }
        );
        toast.success('已添加到购物车');
    };

    // 查看购物车
    const handleViewCart = () => {
        navigate('/cart');
    };

    // 切换规格逻辑（只允许选择有库存的规格）
    const handleSizeChange = (sizeItem) => {
        if (sizeItem.stock > 0) {
            setSelectedSize(sizeItem);
            // 切换规格时重置数量为1（避免数量超过新规格库存）
            setQuantity(1);
        }
    };

    return (
        <div className={styles.plantDetailContainer}>
            {/* 上半部分：图片与购买信息 */}
            <div className={styles.plantMainSection}>
                {/* 左侧：图片展示 */}
                <div className={styles.plantGalleryCol}>
                    <ImageGallery imgUrls={plant.plantImages} />
                </div>

                {/* 右侧：信息面板 */}
                <div className={styles.plantInfoCol}>
                    <header>
                        <h1 className={styles.plantTitle}>{plant.plantName}</h1>
                        <p className={styles.plantLatin}>{plant.plantLatinName}</p>
                        <div className={styles.plantPrice}>
                            ¥ {selectedSize ? selectedSize.price.toFixed(2) : plant.plantMinPrice}
                        </div>
                    </header>

                    <div className="mb-4">
                        <span className={styles.sectionLabel}>选择规格</span>
                        <div className="d-flex flex-wrap">
                            {plant.plantSkus?.map((_) => (
                                <button
                                    key={_.size}
                                    className={`${styles.sizeBtn} 
                                        ${selectedSize?.size === _.size ? styles.active : ''}
                                        ${_.stock <= 0 ? styles.disabled : ''}`}
                                    onClick={() => handleSizeChange(_)}
                                    disabled={_.stock <= 0} // 库存为0时禁用按钮
                                >
                                    <span>{_.size}</span>
                                    <span style={{marginLeft: '6px', fontSize: '12px'}}>
                                        ¥ {_.price.toFixed(2)}
                                    </span>
                                    {/* 库存小于10时显示库存数量 */}
                                    {_.stock < 10 && (
                                        <span
                                            style={{
                                                marginLeft: '4px',
                                                fontSize: '11px',
                                                color: _.stock <= 0 ? '#999' : '#ff6b6b'
                                            }}>
                                            {_.stock <= 0 ? '无货' : `仅剩${_.stock}件`}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <span className={styles.sectionLabel}>购买数量</span>
                        <QuantitySelector
                            quantity={quantity}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            // 禁用减号当数量为1，禁用加号当数量达到库存上限
                            disabledDecrease={quantity <= 1}
                            disabledIncrease={selectedSize && quantity >= selectedSize.stock}
                        />
                        {/* 显示当前规格的库存信息 */}
                        {selectedSize && (
                            <p style={{fontSize: '12px', color: '#666', margin: '4px 0 0 0'}}>
                                库存：{selectedSize.stock} 件
                            </p>
                        )}
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.btnFlatPrimary} ${!selectedSize || selectedSize.stock <= 0 ? styles.btnDisabled : ''}`}
                            onClick={handleAddToCart}
                            disabled={!selectedSize || selectedSize.stock <= 0} // 无选中规格或库存为0时禁用加入购物车
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

            {/* 下半部分：商品介绍 */}
            <div className={styles.plantDescriptionSection}>
                <h4 className={styles.descTitle}>关于植物</h4>
                <p className={styles.descText}>
                    {plant.plantName}（{plant.plantLatinName}）。
                    <br /><br />
                    这是一种独特的蚁栖植物，与蚂蚁形成共生关系。其独特的形态结构不仅具有极高的观赏价值，
                    更是自然界共生智慧的体现。适合室内散射光环境栽培，耐旱性较强，易于养护。
                    无论是放置于极简风格的客厅，还是作为书桌上的点缀，它都能为空间带来一丝静谧的自然气息。
                </p>
            </div>
        </div>
    );
}