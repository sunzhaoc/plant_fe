import {useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import CartItem from '/src/components/Cart/CartItem';
import {useCart} from '/src/context/CartContext';
import styles from '/src/components/Cart/Cart.module.css';
import toast from 'react-hot-toast';
import api from "/src/utils/api.jsx";
import {plantImageApi} from "/src/services/api.jsx";

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
    const [loading, setLoading] = useState(true); // 加载状态标记

    // 立即付款后展示二维码
    const [weChatQrCodeUrl, setWeChatQrcodeUrl] = useState(''); // 二维码
    const [showPaymentModal, setShowPaymentModal] = useState(false);

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

                // 1. 遍历购物车，更新匹配项的quantity和stock
                const updatedCartItems = cartItems.map(item => {
                    const uniqueKey = `${item.id}-${item.skuId}`;
                    const matchedStock = stockMap[uniqueKey];

                    // 匹配到则更新，未匹配则保留原数据
                    if (matchedStock) {
                        return {
                            ...item,
                            quantity: matchedStock.newQuantity,
                            stock: matchedStock.stock
                        };
                    }
                    return item;
                });

                // 过滤掉 quantity 为 0 的项（核心变更）
                setCartItems(updatedCartItems.filter(item => item.quantity > 0));
            } catch (error) {
                console.error(error.response?.data?.message || '刷新购物车失败');
            } finally {
                setLoading(false);
            }
        }
        syncCartStock();
    }, []);

    // 付款
    const handlePayment = () => {
        if (cartItems.length === 0) {
            toast.error('购物车为空！'); // 替换alert为toast更统一
            return;
        }
        setShowPaymentModal(true); // 显示提示弹窗
        // toast.success('付款成功！感谢您的购买。');
        // clearCart();
        // navigate('/');
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
                <div className={`${styles.cartSummaryTotal} d-flex justify-content-between align-items-center mb-4`}>
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
                    >
                        <i className="bi bi-credit-card me-2"></i>立即付款
                    </button>
                </div>
            </div>

            {/* 付款提示弹窗 */}
            {showPaymentModal && (<div className={styles.paymentModalOverlay}>
                <div className={styles.paymentModalContent}>
                    {/* 关闭按钮 */}
                    <button
                        className={styles.modalCloseBtn}
                        onClick={() => setShowPaymentModal(false)}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                    {/* 弹窗标题 */}
                    <div className={styles.modalHeader}>
                        <h4 className="text-center mb-0">功能暂未上线</h4>
                    </div>

                    {/* 弹窗内容 */}
                    <div className={styles.modalBody}>
                        <p className="text-center text-muted mb-4">
                            您好！目前暂不支持下单功能，预计26年3月正式上线，敬请期待～
                        </p>
                        <div className={styles.qrcodeContainer}>
                            <p className="text-center mb-2">可扫码了解更多信息</p>
                            {/* 替换为你的微信二维码图片地址 */}
                            <img
                                src={weChatQrCodeUrl ?? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iI0VFRkVGRiIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iI0RkRURFRCIvPjwvc3ZnPg=='} // 精准兜底
                                alt="微信二维码"
                                className={styles.qrcodeImg}
                                loading="lazy" // 懒加载
                                width={200} // 固定尺寸，避免布局抖动
                                height={200}
                            />
                        </div>
                    </div>
                </div>
            </div>)}
        </div>
    );
}