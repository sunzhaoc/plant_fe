import {useEffect} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {CartProvider} from '/src/context/CartProvider.jsx';
import Header from '/src/components/Layout/Header.jsx';
import Footer from '/src/components/Layout/Footer.jsx';
import Home from '/src/pages/Home.jsx';
import Detail from '/src/pages/Detail.jsx';
import CartPage from '/src/pages/CartPage.jsx';
import QuickCart from '/src/components/Cart/QuickCart.jsx';
import '/src/styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from '/src/context/AuthProvider.jsx';
import AuthModal from '/src/components/Auth/AuthModal';
import ProtectedRoute from '/src/components/Auth/ProtectedRoute.jsx';
import {Toaster} from 'react-hot-toast';

function ScrollToTop() {
    const location = useLocation();
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }, 0);
    }, [location.pathname]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <AuthProvider>
                <CartProvider>
                    <ScrollToTop />
                    <Header />
                    <main className="content">
                        <div className="container">
                            <Routes>
                                {/* 将 index.html 强行重定向到根目录 */}
                                <Route path="/index.html" element={<Navigate to="/" replace />} />

                                <Route path="/" element={<Home />} />

                                <Route
                                    path="/detail/:plantId"
                                    element={<ProtectedRoute> <Detail /> </ProtectedRoute>}
                                />

                                <Route
                                    path="/cart"
                                    element={<ProtectedRoute> <CartPage /> </ProtectedRoute>}
                                />
                            </Routes>
                        </div>
                    </main>
                    <Footer />
                    {/*<QuickCart />*/}
                    <AuthModal />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;