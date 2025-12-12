import {useNavigate} from 'react-router-dom';
import CartItem from '/src/components/Cart/CartItem';
import {useCart} from '/src/context/CartContext';
import '/src/components/Cart/Cart.css';

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
                <hr
                    style={{
                        borderColor: 'rgba(0, 0, 0, 0.4)',
                        borderTopWidth: '1px',
                        margin: '0.75rem 0'
                    }}
                />
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

            <hr
                style={{
                    borderColor: 'rgba(0, 0, 0, 0.4)',
                    borderTopWidth: '1px',
                    margin: '0.75rem 0'
                }} />
            <div className="cart-summary">
                <div className="cart-summary__total d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-medium">总计:</h5>
                    <h4 className="cart-summary__price mb-0 text-primary fw-bold">¥ {getTotalPrice()}</h4>
                </div>
                <div className="cart-summary__actions d-flex gap-3">
                    <button
                        className="btn btn-outline-danger btn-sm-hover flex-grow-1"
                        onClick={clearCart}
                    >
                        <i className="bi bi-trash3 me-2"></i>清空购物车
                    </button>
                    <button
                        className="btn btn-primary btn-lg-hover flex-grow-2"
                        onClick={handlePayment}
                    >
                        <i className="bi bi-credit-card me-2"></i>立即付款
                    </button>
                </div>
            </div>
        </div>
    );
}