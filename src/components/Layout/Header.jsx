import {Link} from 'react-router-dom';
import {useCart} from '/src/context/CartContext';
import {useAuth} from '/src/context/AuthContext';

export default function Header() {
    const {getTotalItems} = useCart();
    const {user, setAuthModalOpen, logout} = useAuth();

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light">

                    <Link className="navbar-brand" to="/" style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>
                        <i className="bi bi-leaf me-2"></i>ANT PLANT | 蚁栖植物商城
                    </Link>

                    {/*购物车*/}
                    <div className="ms-auto">
                        <Link to="/cart" className="btn btn-outline-primary position-relative">
                            <i className="bi bi-cart3 me-1"></i>购物车
                            <span
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {getTotalItems()}
                                <span className="visually-hidden">购物车商品数量</span>
              </span>
                        </Link>
                    </div>

                    {/*用户登录状态*/}
                    {user ? (
                        <div className="d-flex align-items-center gap-3">
                            <span className="user-greeting">您好，{user.username}</span>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={logout}
                            >
                                退出登录
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => setAuthModalOpen(true)}
                        >
                            登录/注册
                        </button>
                    )}

                </nav>
            </div>
        </header>
    );
}