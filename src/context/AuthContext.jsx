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
    const login = async (account, password) => {
        try {
            const response = await api.post('/api/login', {account, password});
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('登录失败:', error.response?.data?.message || error.message);
            return false;
        }
    };

    // 注册函数
    const register = async (username, email, password, phone) => {
        try {
            const response = await api.post('/api/register', {username, email, password, phone});
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            const errMsg = error.response?.data?.message || "注册失败，请稍后重试！";
            return {
                success: false,
                message: errMsg,
            };
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

    return (<AuthContext.Provider
        value={{
            user, authModalOpen, setAuthModalOpen, isLoginMode, setIsLoginMode, login, register, logout
        }}>
        {children}
    </AuthContext.Provider>);
};

export const useAuth = () => useContext(AuthContext);