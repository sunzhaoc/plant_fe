import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ImageGallery from '/src/components/UI/ImageGallery';
import QuantitySelector from '/src/components/UI/QuantitySelector';
import {useCart} from '/src/context/CartContext';
import '/src/components/Plants/PlantDetail.css';

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
        alert('已添加到购物车');
    };

    const handleViewCart = () => {
        navigate('/cart');
    };

    const handleSizeChange = (sizeItem) => {
        setSelectedSize(sizeItem);
    }


    return (
        <div className="plant-detail-container">
            {/* 上半部分：图片与购买信息 */}
            <div className="plant-main-section">

                {/* 左侧：图片展示 */}
                <div className="plant-gallery-col">
                    {/* 确保 ImageGallery 内部样式也尽量简洁，不要有太厚的边框 */}
                    <ImageGallery imgUrls={plant.imgUrl} />
                </div>

                {/* 右侧：信息面板 */}
                <div className="plant-info-col">
                    <header>
                        <h1 className="plant-title">{plant.name}</h1>
                        <p className="plant-latin">{plant.latinName}</p>
                        <div className="plant-price">¥ {selectedSize.price}</div>
                    </header>

                    <div className="mb-4">
                        <span className="section-label">选择规格</span>
                        <div className="d-flex flex-wrap">
                            {plant.sizes.map(_ => (
                                <button
                                    key={_.size}
                                    className={`size-btn ${selectedSize.size === _.size ? 'active' : ''}`}
                                    onClick={() => handleSizeChange(_)}
                                >
                                    {_.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <span className="section-label">购买数量</span>
                        {/* 确保 QuantitySelector 样式也是扁平的，去掉了圆角 */}
                        <QuantitySelector
                            quantity={quantity}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                        />
                    </div>

                    <div className="action-buttons">
                        <button
                            className="btn-flat-primary"
                            onClick={handleAddToCart}
                        >
                            加入购物车
                        </button>
                        <button
                            className="btn-flat-outline"
                            onClick={handleViewCart}
                        >
                            <i className="bi bi-bag me-2"></i>
                            查看
                        </button>
                    </div>
                </div>
            </div>

            {/* 下半部分：商品介绍 (放在最下面) */}
            <div className="plant-description-section">
                <h4 className="desc-title">关于植物</h4>
                <p className="desc-text">
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