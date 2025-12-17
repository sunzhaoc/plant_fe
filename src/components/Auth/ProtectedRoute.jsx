// src/components/ProtectedRoute.jsx
import {Navigate} from 'react-router-dom';
import {useAuth} from '/src/context/AuthContext';
import {useEffect} from 'react';

const ProtectedRoute = ({children}) => {
    const {user, setAuthModalOpen} = useAuth();

    useEffect(() => {
        if (!user) {
            // 如果未登录，自动弹出登录框（可选）
            setAuthModalOpen(true);
        }
    }, [user, setAuthModalOpen]);
    if (!user) {
        // 如果没登录，重定向回首页，禁止查看内容
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;