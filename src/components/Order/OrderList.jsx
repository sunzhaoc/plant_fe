import React, {useState, useEffect} from 'react';
import styles from '/src/components/Order/OrderList.module.css';
import api from "/src/utils/api.jsx";
import {plantImageApi} from "/src/services/api.jsx";

// 订单状态映射
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
    const [imageUrls, setImageUrls] = useState({});
    // 分页相关状态
    const [currentPage, setCurrentPage] = useState(1); // 当前页码
    const [pageSize, setPageSize] = useState(10);      // 每页条数
    const [total, setTotal] = useState(0);             // 总订单数

    // 修改fetchOrders：接收分页参数，请求时传递
    const fetchOrders = async (page = 1, size = 10) => {
        setLoading(true);
        try {
            // 拼接分页参数到URL
            const response = await api.get(`/api/order/get-orders?page=${page}&pageSize=${size}`);
            if (!response || !response.data || response.data.success !== true) {
                console.error('订单接口返回异常:', response);
                setOrders([]);
                setTotal(0);
                return;
            }
            // 解构返回的分页数据：list是当前页订单，total是总条数
            const {list = [], total = 0} = response.data.data || {};
            const sortedOrders = list
                .map(order => ({
                    ...order,
                    order_items: Array.isArray(order.order_items) ? order.order_items : []
                }))
                .sort((a, b) => {
                    const timeA = new Date(a.create_time)?.getTime() || 0;
                    const timeB = new Date(b.create_time)?.getTime() || 0;
                    return timeB - timeA;
                });
            setOrders(sortedOrders);
            setTotal(total); // 保存总条数
            setCurrentPage(page); // 同步当前页码
            setPageSize(size);    // 同步每页条数
        } catch (error) {
            console.error('获取订单失败:', error);
            alert('获取订单失败，请稍后重试');
            setOrders([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // 图片加载失败处理（保持不变）
    const handleImageError = async (imgKey, originalUrl) => {
        try {
            if (imageUrls[imgKey]) return;
            const newUrl = await plantImageApi.getPlantImage(`${originalUrl}?image_process=resize,h_80,w_80`);
            setImageUrls(prev => ({...prev, [imgKey]: newUrl}));
        } catch (error) {
            console.error(`获取备用图片失败（key: ${imgKey}）:`, error);
            setImageUrls(prev => ({
                ...prev,
                [imgKey]: 'https://picsum.photos/seed/plant/200/200'
            }));
        }
    };

    // 格式化金额（保持不变）
    const formatAmount = (amount) => {
        const numAmount = Number(amount);
        return `¥${isNaN(numAmount) ? '0.00' : numAmount.toFixed(2)}`;
    };

    // 格式化时间（保持不变）
    const formatTime = (timeStr) => {
        if (!timeStr) return '未知时间';
        try {
            const date = new Date(timeStr);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return timeStr;
        }
    };

    // 分页控件事件：上一页
    const handlePrevPage = () => {
        if (currentPage > 1) {
            fetchOrders(currentPage - 1, pageSize);
        }
    };

    // 分页控件事件：下一页
    const handleNextPage = () => {
        const maxPage = Math.ceil(total / pageSize);
        if (currentPage < maxPage) {
            fetchOrders(currentPage + 1, pageSize);
        }
    };

    // 初始化加载第一页数据
    useEffect(() => {
        fetchOrders(1, pageSize);
    }, []);

    // 加载中骨架屏（保持不变）
    const renderSkeleton = () => (
        <div className={styles.skeletonWrapper}>
            {[1, 2, 3].map((item) => (
                <div key={item} className={styles.skeletonCard}>
                    <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonLine + ' ' + styles.skeletonLineMd}></div>
                        <div className={styles.skeletonTag}></div>
                    </div>
                    <div className={styles.skeletonMeta}>
                        <div className={styles.skeletonLine + ' ' + styles.skeletonLineSm}></div>
                        <div className={styles.skeletonLine + ' ' + styles.skeletonLineSm}></div>
                    </div>
                    <div className={styles.skeletonProduct}>
                        <div className={styles.skeletonImg}></div>
                        <div className={styles.skeletonProductInfo}>
                            <div className={styles.skeletonLine + ' ' + styles.skeletonLineMd}></div>
                            <div className={styles.skeletonLine + ' ' + styles.skeletonLineSm}></div>
                            <div className={styles.skeletonLine + ' ' + styles.skeletonLineSm}></div>
                        </div>
                        <div className={styles.skeletonPrice}></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // 空状态
    const renderEmpty = () => (
        <div className={styles.emptyWrapper}>
            <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            </div>
            <h3 className={styles.emptyTitle}>暂无订单记录</h3>
            <p className={styles.emptyDesc}>你还没有任何植物订单，快去挑选心仪的绿植吧～</p>
            <button className={styles.emptyBtn}>去逛逛</button>
        </div>
    );

    // 订单列表
    const renderOrderList = () => (
        <div className={styles.orderWrapper}>
            {orders.map((order) => (
                <div key={order.order_sn} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                        <div className={styles.orderStatus}>
                            <span
                                className={`${styles.statusTag} ${orderStatusMap[order.order_status]?.className || styles.statusDefault}`}>
                                {orderStatusMap[order.order_status]?.text || '未知状态'}
                            </span>
                        </div>
                        <div className={styles.orderBasic}>
                            <p className={styles.orderSn}>订单编号：{order.order_sn || '未知编号'}</p>
                            <p className={styles.orderTime}>{formatTime(order.create_time)}</p>
                        </div>
                    </div>

                    <div className={styles.productList}>
                        {order.order_items.length === 0 ? (
                            <div className={styles.emptyProduct}>暂无商品信息</div>
                        ) : (
                            order.order_items.map((item, index) => {
                                const imgKey = `${order.order_sn}-${index}`;
                                const imgSrc = imageUrls[imgKey] || item.main_img_url || 'https://picsum.photos/seed/plant/200/200';

                                return (
                                    <div key={imgKey} className={styles.productItem}>
                                        <img
                                            src={imgSrc}
                                            alt={item.plant_name || '商品图片'}
                                            className={styles.productImg}
                                            loading="lazy"
                                            onError={() => handleImageError(imgKey, order.main_img_url || item.main_img_url)}
                                        />
                                        <div className={styles.productInfo}>
                                            <h4
                                                className={styles.productName}
                                                title={item.plant_name || ''}
                                            >
                                                {item.plant_name || '未知商品'}
                                            </h4>
                                            <p
                                                className={styles.productLatin}
                                                title={item.plant_latin_name || ''}
                                            >
                                                {item.plant_latin_name || '无拉丁学名'}
                                            </p>
                                            <p className={styles.productSpec}>{item.sku_size || '无规格信息'}</p>
                                        </div>
                                        <div className={styles.productPriceWrap}>
                                            <p className={styles.productPrice}>{formatAmount(item.price)}</p>
                                            <p className={styles.productQty}>×{item.quantity || 1}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className={styles.orderAmount}>
                        <div className={styles.amountValue}>
                            <span className={styles.totalLabel}>实付金额：</span>
                            <span className={styles.payAmount}>{formatAmount(order.pay_amount)}</span>
                            {order.total_amount !== order.pay_amount && (
                                <span className={styles.originalAmount}>{formatAmount(order.total_amount)}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // 渲染分页控件
    const renderPagination = () => {
        const maxPage = Math.ceil(total / pageSize);
        // 无数据时不显示分页
        if (total === 0) return null;

        return (
            <div className={styles.paginationWrapper}>
                <button
                    className={`${styles.paginationBtn} ${currentPage === 1 ? styles.disabled : ''}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    上一页
                </button>
                <span className={styles.paginationInfo}>
                    第 {currentPage} 页 / 共 {maxPage} 页（总 {total} 条）
                </span>
                <button
                    className={`${styles.paginationBtn} ${currentPage === maxPage ? styles.disabled : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === maxPage}
                >
                    下一页
                </button>
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>我的订单</h1>
                <p className={styles.pageSubtitle}>共 {total} 笔订单</p> {/* 改为显示总条数 */}
            </div>

            {loading ? renderSkeleton() : (
                orders.length === 0 ? renderEmpty() : (
                    <>
                        {renderOrderList()}
                        {renderPagination()} {/* 渲染分页控件 */}
                    </>
                )
            )}
        </div>
    );
};

export default OrderList;