import {useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import CartItem from '/src/components/Cart/CartItem';
import {useCart} from '/src/context/CartContext';
import styles from '/src/components/Cart/Cart.module.css';
import toast from 'react-hot-toast';
import api from "/src/utils/api.jsx";

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

    useEffect(() => {
        const syncCartStock = async () => {
            try {
                setLoading(true);
                // console.log('原始\n', cartItems);
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
                        newQuantity: Number(item.newQuantity), // 转数字
                        stock: Number(item.stock) // 转数字
                    };
                });

                // console.log("new_version\n", stockMap);

                // 4. 遍历购物车，更新匹配项的quantity和stock
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

                // 5. 更新购物车状态（核心：需确保setCartItems能修改购物车数据）
                // console.log("uddate_version\n", updatedCartItems);
                setCartItems(updatedCartItems);
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
            alert('购物车为空！');
            return;
        }
        toast.success('付款成功！感谢您的购买。');
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
        </div>
    );
}