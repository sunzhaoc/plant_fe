// src/context/AuthContext.jsx
import {createContext, useContext, useState} from 'react';
import api from '/src/utils/api';
import {message} from "antd";

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                console.error("解析本地用户信息失败", e);
                localStorage.removeItem('user');
                return null;
            }
        }
        return null;
    });
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    // 登录函数
    const login = async (account, password) => {
        try {
            const response = await api.post('/api/login', {account, password});
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            const errMsg = error.response?.data?.message || "登录失败，请稍后重试！";
            return {
                success: false,
                message: errMsg,
            };
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
        setUser(null);
        localStorage.removeItem('user');
    };

    return (<AuthContext.Provider
        value={{
            user, authModalOpen, setAuthModalOpen, isLoginMode, setIsLoginMode, login, register, logout
        }}>
        {children}
    </AuthContext.Provider>);
};

export const useAuth = () => useContext(AuthContext);