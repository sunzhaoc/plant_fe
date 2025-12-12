import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {CartProvider} from '/src/context/CartContext.jsx';
import Header from '/src/components/Layout/Header.jsx';
import Footer from '/src/components/Layout/Footer.jsx';
import Home from '/src/pages/Home.jsx';
import Detail from '/src/pages/Detail.jsx';
import CartPage from '/src/pages/CartPage.jsx';
import QuickCart from '/src/components/Cart/QuickCart.jsx'; // 快速购物车
import '/src/styles/main.css';
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