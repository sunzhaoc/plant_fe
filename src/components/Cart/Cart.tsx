import {useNavigate} from 'react-router-dom';
import {useEffect, useState, useCallback, useRef} from 'react';
import CartItem from 'src/components/Cart/CartItem';
import Address from 'src/components/Cart/Address.tsx';
import {useCart} from 'src/context/CartContext';
import styles from 'src/components/Cart/Cart.module.css';
import toast from 'react-hot-toast';
import api from "src/utils/api.jsx";
import {plantImageApi} from "src/services/api.tsx";
import {useAuth} from 'src/context/AuthContext';

interface AddressInfo {
    receiver: string;
    phone: string;
    detailAddress: string;

    [key: string]: any;
}

interface StockInfoItem {
    id: string | number;
    skuId: string | number;
    newQuantity: number;
    stock: number;
}

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
    const [frozenOrderTotal, setFrozenOrderTotal] = useState(0);
    const [currentAddress, setCurrentAddress] = useState<AddressInfo | null>(null);

    // 防循环调用锁：保证库存同步仅在组件挂载时执行一次
    const hasSyncedStock = useRef(false);
    // 组件卸载标记：避免卸载后执行setState导致内存泄漏
    const isUnmounted = useRef(false);

    // 获取微信二维码
    useEffect(() => {
        const getWeChatQrcodeUrl = async () => {
            try {
                const url = await plantImageApi.getPlantImage('plant/website/jietu-1767083270070.jpg?image_process=resize,h_200,w_200');
                if (!isUnmounted.current) {
                    setWeChatQrcodeUrl(url);
                }
            } catch (err) {
                console.error('获取二维码失败：', err);
            }
        };
        void getWeChatQrcodeUrl();

        // 组件卸载清理
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    // 库存同步逻辑（已彻底解决循环调用问题）
    useEffect(() => {
        // 已执行过、组件已卸载、购物车为空，均不执行
        if (hasSyncedStock.current || isUnmounted.current || cartItems.length === 0) return;

        const syncCartStock = async () => {
            try {
                setLoading(true);
                hasSyncedStock.current = true; // 立即上锁，杜绝重复执行
                const response = await api.post(`/api/cart/sync-stock`, {
                    cartItems: cartItems.map((item) => ({
                        id: item.id,
                        skuId: item.skuId,
                        quantity: item.quantity
                    }))
                });
                const stockInfo: StockInfoItem[] = response.data.data.stockInfo;
                const stockMap: Record<string, { newQuantity: number; stock: number }> = {};

                stockInfo.forEach((item) => {
                    stockMap[`${item.id}-${item.skuId}`] = {
                        newQuantity: Number(item.newQuantity),
                        stock: Number(item.stock)
                    };
                });

                // 【类型安全】使用原生CartItem类型，展开保留所有原有属性，仅修改库存和数量
                const updatedItems = cartItems.map((item) => {
                    const matched = stockMap[`${item.id}-${item.skuId}`];
                    return matched ? {...item, quantity: matched.newQuantity, stock: matched.stock} : item;
                });

                // 仅组件未卸载时更新状态
                if (!isUnmounted.current) {
                    // 【修复类型报错】传入的数组完全符合CartItem[]类型，和setCartItems入参完全匹配
                    setCartItems(updatedItems.filter(item => item.quantity > 0));
                }
            } catch (error: unknown) {
                const err = error as { response?: { status: number } };
                if (err.response?.status === 401) {
                    await logout();
                    setAuthModalOpen(true);
                }
            } finally {
                if (!isUnmounted.current) {
                    setLoading(false);
                }
            }
        };

        void syncCartStock();

        // 空依赖数组，仅组件挂载时执行一次，彻底切断死循环
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 地址更新回调
    const handleAddressUpdate = useCallback((addr: AddressInfo) => {
        setCurrentAddress(addr);
    }, []);

    // 提交订单付款逻辑
    const handlePayment = async () => {
        if (cartItems.length === 0) return toast.error('购物车为空！');
        // 收货地址完整校验
        if (!currentAddress?.receiver || !currentAddress?.phone || !currentAddress?.detailAddress) {
            return toast.error('请先完善收货地址');
        }
        if (paymentLoading) return;

        try {
            setPaymentLoading(true);
            const paymentData = {
                cartItems: cartItems.map((item) => ({
                    plantId: item.id,
                    skuId: item.skuId,
                    quantity: item.quantity
                })),
                address: currentAddress
            };
            const response = await api.post('/api/order/create-payment', paymentData);

            if (response.data.success) {
                toast.success('订单已提交！');
                // 类型安全：强制转为数字，匹配state的number类型
                setFrozenOrderTotal(Number(totalPrice));
                setShowPaymentModal(true);
                clearCart();
            } else {
                toast.error('订单提交失败：' + response.data.message);
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message: string } } };
            toast.error(err.response?.data?.message || '付款请求失败');
        } finally {
            if (!isUnmounted.current) {
                setPaymentLoading(false);
            }
        }
    };

    return (
        <div>
            {/* 付款弹窗 */}
            {showPaymentModal && (
                <div className={styles.paymentModalOverlay}>
                    <div className={styles.paymentModalContent}>
                        <button className={styles.modalCloseBtn} onClick={() => setShowPaymentModal(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className={styles.modalHeader}>
                            <h4 className="text-center mb-0">感谢您的购买</h4>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.paymentAmount}>
                                您需要支付
                                <span className={styles.amountNumber}>¥ {frozenOrderTotal}</span>
                            </div>
                            <p className={styles.modalTip}>请添加老板微信付款核对订单信息</p>
                            <div className={styles.qrcodeWrapper}>
                                <div className={styles.qrcodeCard}>
                                    <div className={styles.qrcodeImgBox}>
                                        <img
                                            src={weChatQrCodeUrl}
                                            alt="老板微信二维码"
                                            className={styles.qrcodeImg}
                                        />
                                    </div>
                                    <p className={styles.qrcodeLabel}>
                                        <i className="bi bi-chat-dots"></i>
                                        <span>添加老板微信</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 空购物车状态 */}
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
                // 购物车主内容
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
                    <Address onAddressChange={handleAddressUpdate} />

                    {/* 库存同步加载状态 */}
                    {loading ? (
                        <div className="text-center py-5">
                            <p className="text-muted">正在同步商品库存信息...</p>
                        </div>
                    ) : (
                        <div className="cart-list mb-5">
                            {cartItems.map((item) => (
                                <CartItem
                                    key={`${item.id}-${item.skuId}`}
                                    item={item}
                                    onUpdate={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))}
                        </div>
                    )}

                    {/* 结算栏 */}
                    <div className={styles.cartSummary}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0">总计:</h5>
                            <h4 className="text-primary fw-bold">¥ {totalPrice}</h4>
                        </div>
                        <div className="d-flex gap-3">
                            <button
                                className="btn btn-outline-danger flex-grow-1"
                                onClick={clearCart}
                            >
                                清空购物车
                            </button>
                            <button
                                className="btn btn-primary flex-grow-2"
                                onClick={handlePayment}
                                disabled={paymentLoading || loading}
                            >
                                {paymentLoading ? '处理中...' : '提交订单'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}