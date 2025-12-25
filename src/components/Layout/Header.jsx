import {Link} from 'react-router-dom';
import {useCart} from '/src/context/CartContext';
import {useAuth} from '/src/context/AuthContext';
import styles from '/src/components/Layout/Header.module.css';
import logoImg from '/src/assets/images/logo_min.jpg';

export default function Header() {
    const {totalItems} = useCart();
    const {user, setAuthModalOpen, logout} = useAuth();

    return (
        <header className={styles.header}>
            <div className="container">
                <nav className={styles.nav}>
                    {/* 品牌 Logo */}
                    <Link className={styles.brand} to="/">
                        {/* 2. Insert the img tag before the text */}
                        <img
                            src={logoImg}
                            alt="ANT PLANT Logo"
                            className={styles.logoIcon}
                        />
                        <i className="bi bi-leaf me-2"></i>ANT PLANT | 蚁栖植物商城
                    </Link>

                    {/* 右侧操作组 */}
                    <div className={styles.navGroup}>
                        {user ? (
                            /* 登录状态：显示购物车 + 用户信息 + 退出按钮 */
                            <>
                                <div className={styles.badgeContainer}>
                                    <Link to="/cart" className={styles.cartBtn}>
                                        <i className="bi bi-cart3"></i>
                                        <span>购物车</span>
                                    </Link>
                                    {totalItems > 0 && (
                                        <span className={styles.badge}>{totalItems}</span>
                                    )}
                                </div>

                                <div className={styles.navGroup}>
                                    <p className={styles.userText}>您好，{user.username}</p>
                                    <button className={styles.logoutBtn} onClick={logout}>
                                        退出
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* 未登录状态：仅显示登录/注册按钮 */
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
    );
}