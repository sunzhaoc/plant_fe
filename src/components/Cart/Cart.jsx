import {useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import CartItem from '/src/components/Cart/CartItem';
import {useCart} from '/src/context/CartContext';
import styles from '/src/components/Cart/Cart.module.css';
import toast from 'react-hot-toast';
import api from "/src/utils/api.jsx";
import {plantImageApi} from "/src/services/api.jsx";
import {useAuth} from '/src/context/AuthContext';

export default function Cart() {
    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems,
        setCartItems
    } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [weChatQrCodeUrl, setWeChatQrcodeUrl] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const {logout, setAuthModalOpen} = useAuth();

    // 异步获取微信二维码图片
    useEffect(() => {
        const getWeChatQrcodeUrl = async () => {
            try {
                const weChatQrCodeUrl = await plantImageApi.getPlantImage('plant/website/jietu-1767083270070.jpg?image_process=resize,h_200,w_200');
                setWeChatQrcodeUrl(weChatQrCodeUrl);
            } catch (err) {
                console.error('获取二维码失败：', err)
            }
        };
        getWeChatQrcodeUrl();
    }, []);

    useEffect(() => {
        const syncCartStock = async () => {
            try {
                setLoading(true);
                const response = await api.post(`/api/cart/sync-stock`, {
                    cartItems: cartItems.map(_ => ({
                        id: _.id,
                        skuId: _.skuId,
                        quantity: _.quantity,
                    }))
                });

                const stockInfo = response.data.data.stockInfo;
                const stockMap = {};
                stockInfo.forEach(item => {
                    const uniqueKey = `${item.id}-${item.skuId}`;
                    stockMap[uniqueKey] = {
                        newQuantity: Number(item.newQuantity),
                        stock: Number(item.stock)
                    };
                });

                const updatedCartItems = cartItems.map(item => {
                    const uniqueKey = `${item.id}-${item.skuId}`;
                    const matchedStock = stockMap[uniqueKey];
                    if (matchedStock) {
                        return {
                            ...item,
                            quantity: matchedStock.newQuantity,
                            stock: matchedStock.stock
                        };
                    }
                    return item;
                });
                setCartItems(updatedCartItems.filter(item => item.quantity > 0));
            } catch (error) {
                if (error.response?.status === 401) {
                    logout();
                    setAuthModalOpen(true);
                }
                console.error(error.response?.data?.message || '刷新购物车失败');
            } finally {
                setLoading(false);
            }
        }
        syncCartStock();
    }, []);

    // 付款
    const handlePayment = async () => {
        if (cartItems.length === 0) {
            toast.error('购物车为空！');
            return;
        }
        if (paymentLoading) return;

        try {
            setPaymentLoading(true);
            const paymentData = {
                cartItems: cartItems.map(_ => ({
                    plantId: _.id,
                    skuId: _.skuId,
                    quantity: _.quantity,
                })),
            };
            const response = await api.post('/api/order/create-payment', paymentData);
            if (response.data.success) {
                toast.success('订单已提交！');
                setShowPaymentModal(true);
                clearCart();
                // navigate('/'); // 如需跳转可取消注释
            } else {
                toast.error('订单提交失败：' + response.data.message);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || '付款请求失败，请稍后重试';
            toast.error(errorMsg);
            console.error('付款接口调用失败：', error);
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div>
            {/* 付款提示弹窗：放到最外层，不受购物车状态影响 */}
            {showPaymentModal && (<div className={styles.paymentModalOverlay}>
                <div className={styles.paymentModalContent}>
                    <button
                        className={styles.modalCloseBtn}
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <div className={styles.modalHeader}>
                        <h4 className="text-center mb-0">功能暂未上线</h4>
                    </div>
                    <div className={styles.modalBody}>
                        <p className="text-center text-muted mb-4">
                            您好！目前暂不支持下单功能，预计26年3月正式上线，敬请期待～
                        </p>
                        <div className={styles.qrcodeContainer}>
                            <p className="text-center mb-2">可扫码了解更多信息</p>
                            <img
                                src={weChatQrCodeUrl ?? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg=='}
                                alt="微信二维码"
                                className={styles.qrcodeImg}
                                loading="lazy"
                                width={200}
                                height={200}
                            />
                        </div>
                    </div>
                </div>
            </div>)}

            {/* 空购物车判断 */}
            {cartItems.length === 0 ? (
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
            ) : (
                // 非空购物车内容
                <div>
                    <div className="mb-4">
                        <h3>我的购物车 ({totalItems} 件商品)</h3>
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
                    <div className={styles.cartSummary}>
                        <div
                            className={`${styles.cartSummaryTotal} d-flex justify-content-between align-items-center mb-4`}>
                            <h5 className="mb-0 fw-medium">总计:</h5>
                            <h4 className={`${styles.cartSummaryPrice} mb-0 text-primary fw-bold`}>¥ {totalPrice}</h4>
                        </div>
                        <div className={`${styles.cartSummaryActions} d-flex gap-3`}>
                            <button
                                className={`btn ${styles.btnOutlineDanger} btn-sm-hover flex-grow-1`}
                                onClick={clearCart}
                            >
                                <i className="bi bi-trash3 me-2"></i>清空购物车
                            </button>
                            <button
                                className={`btn ${styles.btnPrimary} btn-lg-hover flex-grow-2`}
                                onClick={handlePayment}
                                disabled={paymentLoading}
                            >
                                {paymentLoading ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2" role="status"
                                            aria-hidden="true"></span>
                                        处理中...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-credit-card me-2"></i>立即付款
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}