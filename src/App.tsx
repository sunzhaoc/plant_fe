import {useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {CartProvider} from 'src/context/CartProvider.jsx';
import Header from 'src/components/Layout/Header.jsx';
import Footer from 'src/components/Layout/Footer.jsx';
import Home from 'src/pages/Home.jsx';
import Detail from 'src/pages/Detail.jsx';
import CartPage from 'src/pages/CartPage.jsx';
import '/src/styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from 'src/context/AuthProvider.jsx';
import AuthModal from 'src/components/Auth/AuthModal';
import ProtectedRoute from 'src/components/Auth/ProtectedRoute.jsx';
import {Toaster} from 'react-hot-toast';
import {PlantProvider} from 'src/context/PlantProvider.jsx';
import OrderPage from 'src/pages/OrderPage';
import TopLevelNav from 'src/components/Plants/TopLevelNav.jsx';
import {getFirstGenus} from 'src/components/Plants/plantCategories';

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
    const [selectedGenus, setSelectedGenus] = useState(() => {
        const defaultGenus = getFirstGenus();
        return defaultGenus || null;
    });

    return (
        <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} />
            <PlantProvider>
                <AuthProvider>
                    <CartProvider>
                        <ScrollToTop />
                        {/* 头部组件 */}
                        <Header />

                        {/* 全局导航栏 */}
                        <TopLevelNav
                            selectedGenus={selectedGenus}
                            onGenusSelect={setSelectedGenus}
                        />

                        {/* 主内容区 */}
                        <main className="content">
                            <div className="container">
                                <Routes>
                                    {/* 重定向 index.html 到根目录 */}
                                    <Route path="/index.html" element={<Navigate to="/" replace />} />

                                    {/* 首页 */}
                                    <Route
                                        path="/" element={
                                        <Home
                                            selectedGenus={selectedGenus}
                                            setSelectedGenus={setSelectedGenus}
                                        />
                                    } />

                                    {/* 详情页 */}
                                    <Route
                                        path="/detail/:plantId"
                                        element={<ProtectedRoute> <Detail /> </ProtectedRoute>}
                                    />

                                    {/* 购物车 */}
                                    <Route
                                        path="/cart"
                                        element={<ProtectedRoute> <CartPage /> </ProtectedRoute>}
                                    />

                                    {/* 订单中心 */}
                                    <Route
                                        path="/orders"
                                        element={<ProtectedRoute> <OrderPage /> </ProtectedRoute>}
                                    />
                                </Routes>
                            </div>
                        </main>
                        <Footer />
                        <AuthModal />
                    </CartProvider>
                </AuthProvider>
            </PlantProvider>
        </BrowserRouter>
    );
}

export default App;