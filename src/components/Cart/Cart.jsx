import {useNavigate} from 'react-router-dom';
import CartItem from '/src/components/Cart/CartItem';
import {useCart} from '/src/context/CartContext';

export default function Cart() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        getTotalItems
    } = useCart();
    const navigate = useNavigate();

    // 付款
    const handlePayment = () => {
        if (cartItems.length === 0) {
            alert('购物车为空！');
            return;
        }
        alert('付款成功！感谢您的购买。');
        clearCart();
        navigate('/');
    };

    // 空购物车渲染逻辑
    if (cartItems.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                <h3>购物车为空</h3>
                <p className="text-muted mb-4">快去挑选心仪的蚁栖植物吧！</p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                >
                    返回首页
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4">
                <h3>我的购物车 ({getTotalItems()} 件商品)</h3>
                <hr />
            </div>

            <div className="cart-list mb-5">
                {cartItems.map((item, index) => (
                    <CartItem
                        key={`${item.id}-${item.size}-${index}`}
                        item={item}
                        onUpdate={updateQuantity}
                        onRemove={removeFromCart}
                    />
                ))}
            </div>

            <div className="cart-summary">
                <div className="d-flex justify-content-between mb-3">
                    <h5>总计:</h5>
                    <h4 className="text-primary fw-bold">¥ {getTotalPrice()}</h4>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-danger flex-grow-1"
                        onClick={clearCart}
                    >
                        <i className="bi bi-trash3 me-2"></i>清空购物车
                    </button>
                    <button
                        className="btn btn-primary flex-grow-2"
                        onClick={handlePayment}
                    >
                        <i className="bi bi-credit-card me-2"></i>立即付款
                    </button>
                </div>
            </div>
        </div>
    );
}