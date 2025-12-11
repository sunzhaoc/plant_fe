import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {CartProvider} from './context/CartContext.jsx';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import Home from './pages/Home.jsx';
import Detail from './pages/Detail.jsx';
import CartPage from './pages/CartPage.jsx';
import QuickCart from './components/Cart/QuickCart.jsx'; // 快速购物车
import './styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <CartProvider>
            <Router>
                <Header />
                <main className="content">
                    <div className="container">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/detail/:id" element={<Detail />} />
                            <Route path="/cart" element={<CartPage />} />
                        </Routes>
                    </div>
                </main>
                <Footer />
                <QuickCart />
            </Router>
        </CartProvider>
    );
}

export default App;