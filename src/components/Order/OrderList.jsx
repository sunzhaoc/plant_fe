import React, {useState, useEffect} from 'react';
import styles from '/src/components/Order/OrderList.module.css';
import api from "/src/utils/api.jsx";
import {plantImageApi} from "/src/services/api.jsx";

// 订单状态映射（可根据实际业务调整）
const orderStatusMap = {
    0: {text: '待付款', className: styles.statusPending},
    2: {text: '已付款', className: styles.statusPaid},
    3: {text: '已发货', className: styles.statusShipped},
    4: {text: '已完成', className: styles.statusCompleted},
    5: {text: '已取消', className: styles.statusCancelled},
};

const OrderList = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    // 新增：存储每个商品项的图片URL（key为唯一标识，value为图片地址）
    const [imageUrls, setImageUrls] = useState({});

    // 获取订单并排序
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/order/get-orders`);

            // 关键修改1：增加多层边界检查，避免数据格式异常
            if (!response || !response.data || response.data.success !== true) {
                console.error('订单接口返回异常:', response);
                setOrders([]);
                return;
            }

            // 确保订单列表是数组
            const rawOrders = Array.isArray(response.data.data) ? response.data.data : [];

            // 排序 + 确保order_items是数组（核心修复点）
            const sortedOrders = rawOrders.map(order => ({
                ...order,
                // 关键修改2：兜底order_items为空数组，避免map报错
                order_items: Array.isArray(order.order_items) ? order.order_items : []
            })).sort((a, b) => {
                // 关键修改3：时间排序增加容错，避免无效时间导致排序异常
                const timeA = new Date(a.create_time)?.getTime() || 0;
                const timeB = new Date(b.create_time)?.getTime() || 0;
                return timeB - timeA;
            });

            console.log("排序后的：", sortedOrders);
            setOrders(sortedOrders);
        } catch (error) {
            console.error('获取订单失败:', error);
            alert('获取订单失败，请稍后重试');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // 新增：图片加载失败的异步处理函数
    const handleImageError = async (imgKey, originalUrl) => {
        try {
            // 避免重复请求：如果已经有备用地址，不再请求
            if (imageUrls[imgKey]) return;
            // 拼接处理参数并调用接口获取新图片地址
            const newUrl = await plantImageApi.getPlantImage(`${originalUrl}?image_process=resize,h_80,w_80`);
            // 更新对应图片的URL
            setImageUrls(prev => ({
                ...prev,
                [imgKey]: newUrl
            }));
        } catch (error) {
            console.error(`获取备用图片失败（key: ${imgKey}）:`, error);
            // 兜底：设置默认图片地址
            setImageUrls(prev => ({
                ...prev,
                [imgKey]: 'https://picsum.photos/200/200?random=0'
            }));
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 格式化金额
    const formatAmount = (amount) => {
        // 关键修改4：金额格式化增加容错，避免非数字报错
        const numAmount = Number(amount);
        return `¥${isNaN(numAmount) ? '0.00' : numAmount.toFixed(2)}`;
    };


    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>正在加载订单数据...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>我的订单</h1>

            {/* 空数据状态 */}
            {orders.length === 0 && (
                <div className={styles.emptyContainer}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="#ccc" />
                    </svg>
                    <p>暂无订单记录</p>
                    <button className={styles.emptyBtn}>去逛逛</button>
                </div>
            )}

            {/* 订单列表 */}
            {orders.length > 0 && (
                <div className={styles.orderList}>
                    {orders.map((order) => (
                        <div key={order.order_sn} className={styles.orderCard}>
                            {/* 订单头部信息 */}
                            <div className={styles.orderHeader}>
                                <div className={styles.orderSn}>
                                    订单编号：{order.order_sn || '未知编号'}
                                </div>
                                <div className={styles.orderStatus}>
                                    <span
                                        className={`${styles.statusTag} ${orderStatusMap[order.order_status]?.className || styles.statusDefault}`}>
                                        {orderStatusMap[order.order_status]?.text || '未知状态'}
                                    </span>
                                </div>
                            </div>

                            {/* 订单金额与时间 */}
                            <div className={styles.orderInfo}>
                                <div className={styles.orderTime}> 下单时间：{order.create_time} </div>
                                <div className={styles.orderAmount}>
                                    <p>总金额：{formatAmount(order.total_amount)}</p>
                                    <p>实付金额：
                                        <span className={styles.payAmount}>{formatAmount(order.pay_amount)}</span>
                                    </p>
                                </div>
                            </div>

                            {/* 订单商品列表 */}
                            <div className={styles.productList}>
                                {order.order_items.length === 0 ? (
                                    <div className={styles.emptyProduct}>暂无商品信息</div>
                                ) : (
                                    order.order_items.map((item, index) => {
                                        // 生成每个商品图片的唯一标识（避免重复）
                                        const imgKey = `${order.order_sn}-${index}`;
                                        // TODO（需要再测试一下）优先使用备用地址，无则使用原始地址，兜底默认图
                                        const imgSrc = imageUrls[imgKey] || item.main_img_url || 'https://picsum.photos/200/200?random=0';
                                        return (
                                            <div key={imgKey} className={styles.productItem}>
                                                {/* 图片 */}
                                                <img
                                                    src={imgSrc}
                                                    alt={item.plant_name || '商品图片'}
                                                    className={styles.productImage}
                                                    loading="lazy"
                                                    onError={() => handleImageError(imgKey, order.main_img_url || item.main_img_url)}
                                                />
                                                {/* 商品信息 */}
                                                <div className={styles.productInfo}>
                                                    <h3 className={styles.productName}>{item.plant_name || ''}</h3>
                                                    <p className={styles.productSpec}>{item.sku_size || ''}</p>
                                                    <p className={styles.productLatin}>{item.plant_latin_name || ''}</p>
                                                </div>
                                                {/* 单价 数量 */}
                                                <div className={styles.productPriceQty}>
                                                    <p className={styles.productPrice}>{formatAmount(item.price)}</p>
                                                    <p className={styles.productQty}>×{item.quantity || 1}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* 订单操作区（可扩展） */}
                            {/*<div className={styles.orderActions}>*/}
                            {/*    <button className={styles.actionBtn}>查看详情</button>*/}
                            {/*    <button className={styles.actionBtnOutline}>联系客服</button>*/}
                            {/*</div>*/}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderList;