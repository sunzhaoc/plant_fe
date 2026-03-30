import {useCallback, useEffect, useState} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {CartProvider} from 'src/context/CartProvider.tsx';
import Header from 'src/components/Layout/Header.tsx';
import Footer from 'src/components/Layout/Footer.tsx';
import Home from 'src/pages/Home.tsx';
import Detail from 'src/pages/Detail.tsx';
import CartPage from 'src/pages/CartPage.tsx';
import '/src/styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {AuthProvider} from 'src/context/AuthProvider.tsx';
import AuthModal from 'src/components/Auth/AuthModal';
import ProtectedRoute from 'src/components/Auth/ProtectedRoute.tsx';
import {Toaster} from 'react-hot-toast';
import {PlantProvider} from 'src/context/PlantProvider.tsx';
import OrderPage from 'src/pages/OrderPage';
import TopLevelNav from 'src/components/Plants/TopLevelNav.tsx';
import PlantManagement from "src/pages/ProductsPage.tsx";

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
    // 新品选中状态（默认显示新品）
    const [selectedIsNew, setSelectedIsNew] = useState<boolean>(true);
    // 植物属选中状态
    const [selectedGenus, setSelectedGenus] = useState<string | undefined>(undefined);

    // 处理植物属选择（同时取消新品选中）
    const handleGenusSelect = useCallback((genus: string) => {
        setSelectedGenus(genus);
        setSelectedIsNew(false);
    }, []);

    // 处理新品选择（同时清空植物属选中）
    const handleNewProductSelect = useCallback(() => {
        setSelectedIsNew(true);
        setSelectedGenus(undefined);
    }, []);

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
                            selectedIsNew={selectedIsNew} // 传递新品选中状态
                            onGenusSelect={handleGenusSelect} // 传递属选择回调
                            onNewProductSelect={handleNewProductSelect} // 传递新品选择回调
                        />

                        {/* 主内容区 */}
                        <main className="content">
                            <div className="container">
                                <Routes>
                                    {/* 重定向 index.html 到根目录 */}
                                    <Route path="/index.html" element={<Navigate to="/" replace />} />

                                    {/* 首页 - 传递新品状态给 Home 页面 */}
                                    <Route
                                        path="/"
                                        element={
                                            <Home
                                                selectedGenus={selectedGenus}
                                                selectedIsNew={selectedIsNew}
                                                setSelectedGenus={handleGenusSelect}
                                                setSelectedIsNew={setSelectedIsNew}
                                            />
                                        }
                                    />

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

                                    {/* 商品管理 */}
                                    <Route
                                        path="/admin/products"
                                        element={<ProtectedRoute> <PlantManagement /> </ProtectedRoute>}
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