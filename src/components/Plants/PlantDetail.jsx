import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ImageGallery from '../UI/ImageGallery';
import QuantitySelector from '../UI/QuantitySelector';
import {useCart} from '../../context/CartContext';

export default function PlantDetail({plant}) {
    const [selectedSize, setSelectedSize] = useState(plant.sizes[0]);
    const [quantity, setQuantity] = useState(1);
    const {addToCart} = useCart();
    const navigate = useNavigate();

    const handleIncrease = () => setQuantity(prev => prev + 1);
    const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));

    const handleAddToCart = () => {
        addToCart(plant, selectedSize, quantity);
        alert('已添加到购物车！');
    };

    const handleViewCart = () => {
        navigate('/cart');
    };

    return (
        <div className="row">
            <div className="col-md-6">
                <ImageGallery images={plant.images}/>
            </div>
            <div className="col-md-6">
                <h1 className="mb-2">{plant.name}</h1>
                <p className="text-muted fs-5">{plant.latinName}</p>
                <hr/>
                <p className="fs-4 text-primary fw-bold">¥{plant.price}</p>

                <div className="mb-4">
                    <h5>规格选择</h5>
                    <div className="d-flex gap-2 mb-3">
                        {plant.sizes.map(size => (
                            <button
                                key={size}
                                className={`btn ${selectedSize === size ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h5>数量</h5>
                    <QuantitySelector
                        quantity={quantity}
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                    />
                </div>

                <div className="d-flex gap-3">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleAddToCart}
                    >
                        <i className="bi bi-cart-plus me-2"></i>加入购物车
                    </button>
                    <button
                        className="btn btn-outline-primary btn-lg"
                        onClick={handleViewCart}
                    >
                        <i className="bi bi-cart3 me-2"></i>查看购物车
                    </button>
                </div>

                <div className="mt-5">
                    <h4>商品介绍</h4>
                    <p className="text-muted">
                        {plant.name}（{plant.latinName}）是一种独特的蚁栖植物，
                        与蚂蚁形成共生关系，适合室内栽培，易于养护，
                        是植物爱好者的理想选择。
                    </p>
                </div>
            </div>
        </div>
    );
}