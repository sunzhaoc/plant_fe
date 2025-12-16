// src/context/AuthContext.jsx
import {createContext, useContext, useState, useEffect} from 'react';
import api from '/src/utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    // 检查本地存储中的用户状态
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("解析本地用户信息失败", e);
                localStorage.removeItem('user');
            }
        }
    }, []);

    // 登录函数
    const login = async (email, password) => {
        try {
            // 使用 api.post 代替 fetch
            // 注意：Axios 会自动处理 JSON.stringify
            const response = await api.post('/api/login', {email, password});

            // Axios 默认认为 2xx 状态码为成功，数据在 response.data 中
            const userData = response.data.user;

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (error) {
            // Axios 的错误对象包含更多信息，如 error.response
            console.error('登录失败:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // 注册函数
    const register = async (username, email, password) => {
        try {
            const response = await api.post('/api/register', {username, email, password});
            return response.data.success;
        } catch (error) {
            console.error('注册失败:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // 退出登录
    const logout = async () => {
        try {
            setUser(null);
            localStorage.removeItem('user');
            // 建议也使用 api 实例，以保持 base URL 和 headers 的一致性
            await api.post('/api/logout');
        } catch (error) {
            console.error('退出登录请求失败:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                authModalOpen,
                setAuthModalOpen,
                isLoginMode,
                setIsLoginMode,
                login,
                register,
                logout
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);