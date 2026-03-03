import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '/src/context/CartContext';
import {useAuth} from '/src/context/AuthContext';
import styles from '/src/components/Layout/Header.module.css';
import logoImg from '/src/assets/images/logo_min.jpg';

/**
 * 页面头部组件
 * 包含：顶部功能通栏 + 核心导航区（Logo + 登录/购物车/用户菜单）
 */
export default function Header() {
    // 购物车上下文 - 商品总数
    const {totalItems} = useCart();
    // 鉴权上下文 - 用户信息、登录弹窗控制、退出登录方法
    const {user, setAuthModalOpen, logout} = useAuth();
    // 控制用户下拉菜单的显隐状态
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <>
            {/* 顶部功能通栏：展示平台核心优势 */}
            <div className={styles.topBar}>
                <div className="container">
                    <div className={styles.topBarList}>
                        <div className={styles.topBarItem}>
                            <i className="bi bi-mortarboard"></i>
                            <span>More than 15 years experience</span>
                        </div>
                        <div className={styles.topBarItem}>
                            <i className="bi bi-globe2"></i>
                            <span>Nationwide Shipping</span>
                        </div>
                        <div className={styles.topBarItem}>
                            <i className="bi bi-star-fill"></i>
                            <span>Top quality</span>
                        </div>
                        <div className={styles.topBarItem}>
                            <i className="bi bi-tree"></i>
                            <span>Own Propagation Nursery</span>
                        </div>
                        <div className={styles.topBarItem}>
                            <i className="bi bi-house-door"></i>
                            <span>Directly from the producer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 核心导航头部：Logo + 功能按钮区 */}
            <header className={styles.header}>
                <div className="container">
                    <nav className={styles.nav}>
                        {/* 品牌 Logo 区域 */}
                        <Link className={styles.brand} to="/">
                            <img
                                src={logoImg}
                                alt="ANT PLANT Logo"
                                className={styles.logoIcon}
                            />
                            <span className={styles.brandText}>ANT PLANT | 蚁栖植物商城</span>
                        </Link>

                        {/* 右侧功能按钮组：根据登录状态展示不同内容 */}
                        <div className={styles.navGroup}>
                            {user ? (
                                // 已登录状态：我的订单 + 购物车（带数量角标） + 用户菜单
                                <>
                                    <Link to="/orders" className={styles.iconBtn} title="我的订单">
                                        <i className="bi bi-list-check"></i>
                                    </Link>

                                    {/* 购物车按钮 + 商品数量角标 */}
                                    <div className={styles.badgeContainer}>
                                        <Link to="/cart" className={styles.iconBtn} title="购物车">
                                            <i className="bi bi-cart3"></i>
                                        </Link>
                                        {totalItems > 0 && (
                                            <span className={styles.badge}>{totalItems}</span>
                                        )}
                                    </div>

                                    {/* 用户菜单：鼠标悬浮展开下拉框 */}
                                    <div
                                        className={styles.userMenu}
                                        onMouseEnter={() => setIsUserMenuOpen(true)}
                                        onMouseLeave={() => setIsUserMenuOpen(false)}
                                    >
                                        <button className={styles.iconBtn} title="用户菜单">
                                            <i className="bi bi-person-circle"></i>
                                        </button>
                                        <div
                                            className={`${styles.userDropdown} ${
                                                isUserMenuOpen ? styles.userDropdownActive : ''
                                            }`}
                                        >
                                            <p className={styles.userText}>您好，{user.username}</p>
                                            <button className={styles.logoutBtn} onClick={logout}>
                                                退出
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // 未登录状态：仅展示登录/注册按钮（点击打开登录弹窗）
                                <button
                                    className={styles.authBtn}
                                    onClick={() => setAuthModalOpen(true)}
                                >
                                    登录/注册
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            </header>
        </>
    );
}