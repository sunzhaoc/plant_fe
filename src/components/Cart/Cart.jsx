import {useNavigate} from 'react-router-dom';
import {useEffect, useState, useCallback} from 'react';
import CartItem from '/src/components/Cart/CartItem';
import Address from '/src/components/Cart/Address.jsx';
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
    const {logout, setAuthModalOpen} = useAuth();
    const [loading, setLoading] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [weChatQrCodeUrl, setWeChatQrcodeUrl] = useState('');

    // 仅保存当前有效的地址引用，用于下单
    const [currentAddress, setCurrentAddress] = useState(null);

    // 获取微信二维码
    useEffect(() => {
        const getWeChatQrcodeUrl = async () => {
            try {
                const weChatQrCodeUrl = await plantImageApi.getPlantImage('plant/website/jietu-1767083270070.jpg?image_process=resize,h_200,w_200');
                setWeChatQrcodeUrl(weChatQrCodeUrl);
            } catch (err) {
                console.error('获取二维码失败：', err);
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
                        quantity: _.quantity
                    }))
                });
                const stockInfo = response.data.data.stockInfo;
                const stockMap = {};
                stockInfo.forEach(item => {
                    stockMap[`${item.id}-${item.skuId}`] = {
                        newQuantity: Number(item.newQuantity),
                        stock: Number(item.stock)
                    };
                });
                const updatedItems = cartItems.map(item => {
                    const matched = stockMap[`${item.id}-${item.skuId}`];
                    return matched ? {...item, quantity: matched.newQuantity, stock: matched.stock} : item;
                });
                setCartItems(updatedItems.filter(item => item.quantity > 0));
            } catch (error) {
                if (error.response?.status === 401) {
                    logout();
                    setAuthModalOpen(true);
                }
            } finally {
                setLoading(false);
            }
        };
        if (cartItems.length > 0) {
            syncCartStock();
        }
    }, []);

    // 处理地址变更的回调
    const handleAddressUpdate = useCallback((addr) => {
        setCurrentAddress(addr);
    }, []);

    // 付款
    const handlePayment = async () => {
        if (cartItems.length === 0) return toast.error('购物车为空！');

        // 校验地址是否存在
        if (!currentAddress?.receiver || !currentAddress?.phone || !currentAddress?.detailAddress) {
            return toast.error('请先完善收货地址');
        }

        if (paymentLoading) return;
        try {
            setPaymentLoading(true);
            const paymentData = {
                cartItems: cartItems.map(_ => ({
                    plantId: _.id,
                    skuId: _.skuId,
                    quantity: _.quantity
                })),
                address: currentAddress
            };
            const response = await api.post('/api/order/create-payment', paymentData);
            if (response.data.success) {
                toast.success('订单已提交！');
                setShowPaymentModal(true);
                clearCart();
            } else {
                toast.error('订单提交失败：' + response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || '付款请求失败');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div>
            {/* 付款成功/暂未上线弹窗 */}
            {showPaymentModal && (
                <div className={styles.paymentModalOverlay}>
                    <div className={styles.paymentModalContent}>
                        <button className={styles.modalCloseBtn} onClick={() => setShowPaymentModal(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className={styles.modalHeader}><h4 className="text-center mb-0">功能暂未上线</h4></div>
                        <div className={styles.modalBody}>
                            <p className="text-center text-muted mb-4">预计26年3月正式上线，敬请期待～</p>
                            <div className={styles.qrcodeContainer}>
                                <img
                                    src={weChatQrCodeUrl} alt="二维码" className={styles.qrcodeImg} width={200}
                                    height={200}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 空购物车判断 */}
            {cartItems.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-cart-x fs-1 text-muted mb-3"></i>
                    <h3>购物车为空</h3>
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
                        <h3>购物车 ({totalItems} 件商品)</h3>
                        <hr
                            style={{
                                borderColor: 'rgba(0, 0, 0, 0.4)',
                                margin: '0.75rem 0'
                            }}
                        />
                    </div>

                    {/* 使用拆分出的地址组件 */}
                    <Address onAddressChange={handleAddressUpdate} />

                    <div className="cart-list mb-5">
                        {cartItems.map((item, index) => (
                            <CartItem
                                key={`${item.id}-${index}`}
                                item={item}
                                onUpdate={updateQuantity}
                                onRemove={removeFromCart}
                            />
                        ))}
                    </div>

                    <div className={styles.cartSummary}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">总计:</h5>
                            <h4 className="text-primary fw-bold">¥ {totalPrice}</h4>
                        </div>
                        <div className="d-flex gap-3">
                            <button
                                className="btn btn-outline-danger flex-grow-1"
                                onClick={clearCart}>清空购物车
                            </button>
                            <button
                                className="btn btn-primary flex-grow-2"
                                onClick={handlePayment}
                                disabled={paymentLoading}>
                                {paymentLoading ? '处理中...' : '立即付款'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}