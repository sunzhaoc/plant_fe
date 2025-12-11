import {Link} from 'react-router-dom';
import {useCart} from '../../context/CartContext';

export default function Header() {
    const {getTotalItems} = useCart();

    return (
        <header className="header">
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar-light">
                    <Link className="navbar-brand" to="/" style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>
                        <i className="bi bi-leaf me-2"></i>蚁栖植物商城
                    </Link>

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
                </nav>
            </div>
        </header>
    );
}