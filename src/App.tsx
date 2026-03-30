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

/**
 * ScrollToTop 组件：路由切换时自动滚动到页面顶部
 * 解决React Router单页应用路由切换后页面停留在原位置的问题
 */
function ScrollToTop() {
    // 获取当前路由位置信息
    const location = useLocation();
    // 监听路由pathname变化，触发滚动操作
    useEffect(() => {
        setTimeout(() => {
            window.scrollTo({
                top: 0, // 滚动到顶部
                left: 0, // 水平位置归零
                behavior: 'smooth' // 平滑滚动效果
            });
        }, 0);
    }, [location.pathname]); // 路由路径变化时触发
    return null;
}

/**
 * App 根组件：应用的核心入口组件
 * 负责整合全局上下文、路由配置、布局组件和全局状态管理
 */
function App() {
    // 新品选中状态管理 - 初始值为true（默认显示新品）
    const [selectedIsNew, setSelectedIsNew] = useState<boolean>(true);

    // 植物属选中状态管理 - 初始值为undefined（未选中任何属）
    const [selectedGenus, setSelectedGenus] = useState<string | undefined>(undefined);

    /**
     * 处理植物属选择的回调函数
     * @param genus 选中的植物属名称
     * 功能：更新选中的植物属，同时取消新品选中状态（二选一逻辑）
     */
    const handleGenusSelect = useCallback((genus: string) => {
        setSelectedGenus(genus);
        setSelectedIsNew(false);
    }, []); // 空依赖数组：缓存函数，仅初始化一次

    /**
     * 处理新品选择的回调函数
     * 功能：选中新品状态，同时清空植物属选中状态（二选一逻辑）
     */
    const handleNewProductSelect = useCallback(() => {
        setSelectedIsNew(true);
        setSelectedGenus(undefined);
    }, []); // 空依赖数组：缓存函数，仅初始化一次

    // 根组件渲染内容
    return (
        <BrowserRouter>
            {/* 全局消息提示组件：位置在顶部居中，按顺序显示提示 */}
            <Toaster position="top-center" reverseOrder={false} />

            {/* 植物数据上下文提供者：全局共享植物相关数据 */}
            <PlantProvider>
                {/* 认证上下文提供者：全局共享用户登录状态、登录/注册方法 */}
                <AuthProvider>
                    {/* 购物车上下文提供者：全局共享购物车数据、加购/删除方法 */}
                    <CartProvider>
                        {/* 路由切换滚动到顶部组件 */}
                        <ScrollToTop />

                        {/* 页面头部组件：包含logo、导航、登录/购物车入口等 */}
                        <Header />

                        {/* 全局植物分类导航栏：展示植物属分类和新品入口 */}
                        <TopLevelNav
                            selectedGenus={selectedGenus} // 传递当前选中的植物属
                            selectedIsNew={selectedIsNew} // 传递当前新品选中状态
                            onGenusSelect={handleGenusSelect} // 传递植物属选择回调
                            onNewProductSelect={handleNewProductSelect} // 传递新品选择回调
                        />

                        {/* 主内容区域：包含所有页面的核心内容 */}
                        <main className="content">
                            {/* 容器组件：使用bootstrap的container样式，适配不同屏幕尺寸 */}
                            <div className="container">
                                {/* 路由表：配置所有页面的路由规则 */}
                                <Routes>
                                    {/* 重定向规则：将/index.html路径重定向到根路径/，replace避免历史记录重复 */}
                                    <Route path="/index.html" element={<Navigate to="/" replace />} />

                                    {/* 首页路由：根路径/ */}
                                    <Route
                                        path="/"
                                        element={
                                            <Home
                                                selectedGenus={selectedGenus} // 传递选中的植物属
                                                selectedIsNew={selectedIsNew} // 传递新品选中状态
                                                setSelectedGenus={handleGenusSelect} // 传递植物属更新方法
                                                setSelectedIsNew={setSelectedIsNew} // 传递新品状态更新方法
                                            />
                                        }
                                    />

                                    {/* 植物详情页路由：动态路由参数plantId，对应具体植物ID */}
                                    {/* 受保护路由：未登录用户访问会跳转到登录页 */}
                                    <Route
                                        path="/detail/:plantId"
                                        element={<ProtectedRoute> <Detail /> </ProtectedRoute>}
                                    />

                                    {/* 购物车页面路由 */}
                                    {/* 受保护路由：未登录用户访问会跳转到登录页 */}
                                    <Route
                                        path="/cart"
                                        element={<ProtectedRoute> <CartPage /> </ProtectedRoute>}
                                    />

                                    {/* 订单中心页面路由 */}
                                    {/* 受保护路由：未登录用户访问会跳转到登录页 */}
                                    <Route
                                        path="/orders"
                                        element={<ProtectedRoute> <OrderPage /> </ProtectedRoute>}
                                    />

                                    {/* 商品管理页面路由（管理员功能） */}
                                    {/* 受保护路由：未登录/非管理员用户访问会被限制 */}
                                    <Route
                                        path="/admin/products"
                                        element={<ProtectedRoute> <PlantManagement /> </ProtectedRoute>}
                                    />
                                </Routes>
                            </div>
                        </main>

                        {/* 页面底部组件：包含版权、联系方式、导航链接等 */}
                        <Footer />

                        {/* 全局登录/注册模态框：悬浮在页面底部，全局可触发 */}
                        <AuthModal />
                    </CartProvider>
                </AuthProvider>
            </PlantProvider>
        </BrowserRouter>
    );
}

// 导出App组件作为应用的根组件，供入口文件渲染
export default App;
