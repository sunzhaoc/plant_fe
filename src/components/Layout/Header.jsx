import {Link} from 'react-router-dom';
import {useCart} from '/src/context/CartContext';
import {useAuth} from '/src/context/AuthContext';
import styles from '/src/components/Layout/Header.module.css';

export default function Header() {
    const {getTotalItems} = useCart();
    const {user, setAuthModalOpen, logout} = useAuth();

    return (
        <header className={styles.header}>
            <div className="container">
                <nav className={styles.nav}>
                    {/* 品牌 Logo */}
                    <Link className={styles.brand} to="/">
                        <i className="bi bi-leaf me-2"></i>ANT PLANT | 蚁栖植物商城
                    </Link>

                    {/* 右侧操作组 */}
                    <div className={styles.navGroup}>
                        {/* 购物车按钮 */}
                        <div className={styles.badgeContainer}>
                            <Link to="/cart" className={styles.cartBtn}>
                                <i className="bi bi-cart3"></i>
                                <span>购物车</span>
                            </Link>
                            {/* 购物车数量徽章 */}
                            {getTotalItems() > 0 && (
                                <span className={styles.badge}>{getTotalItems()}</span>
                            )}
                        </div>

                        {/* 用户登录状态 */}
                        {user ? (
                            <div className={styles.navGroup}>
                                <p className={styles.userText}>您好，{user.username}</p>
                                <button className={styles.logoutBtn} onClick={logout}>
                                    退出登录
                                </button>
                            </div>
                        ) : (
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