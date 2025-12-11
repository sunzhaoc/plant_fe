import { useLocation, useNavigate } from 'react-router-dom';
import CartItem from './CartItem.jsx';
import { useCart } from '@/context/CartContext.jsx';

export default function QuickCart() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalPrice,
        quickCartOpen,
        setQuickCartOpen
    } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    // 在购物车主页面不显示快速购物车
    if (location.pathname === '/cart') return null;

    const handlePayment = () => {
        if (cartItems.length === 0) {
            alert('购物车为空！');
            return;
        }
        setQuickCartOpen(false);
        navigate('/cart');
    };

    return (
        <>
            {/* 快速购物车切换按钮 - 内联样式强化定位 */}
            <button
                className="quick-cart-toggle"
                onClick={() => setQuickCartOpen(!quickCartOpen)}
                style={{
                    position: 'fixed',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1040,
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                }}
            >
                <i className="bi bi-cart3 fs-4"></i>
            </button>

            {/* 快速购物车面板 - 内联样式强化定位 */}
            <div
                className={`quick-cart ${quickCartOpen ? 'show' : ''}`}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: '350px',
                    backgroundColor: 'white',
                    boxShadow: '-2px 0 10px rgba(0,0,0,0.2)',
                    zIndex: 1050,
                    transform: quickCartOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    overflowY: 'auto',
                    padding: 0,
                    margin: 0,
                }}
            >
                <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4>快速购物车</h4>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setQuickCartOpen(false)}
                        >
                            <i className="bi bi-x"></i>
                        </button>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-muted">购物车为空</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                                {cartItems.map((item, index) => (
                                    <CartItem
                                        key={`${item.id}-${item.size}-${index}`}
                                        item={item}
                                        onUpdate={updateQuantity}
                                        onRemove={removeFromCart}
                                    />
                                ))}
                            </div>

                            <div className="border-top pt-3">
                                <div className="d-flex justify-content-between mb-3">
                                    <h6>总计:</h6>
                                    <h5 className="text-primary">¥{getTotalPrice()}</h5>
                                </div>
                                <button
                                    className="btn btn-primary w-100 mb-2"
                                    onClick={handlePayment}
                                >
                                    去结算
                                </button>
                                <button
                                    className="btn btn-outline-danger w-100"
                                    onClick={clearCart}
                                >
                                    清空购物车
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}