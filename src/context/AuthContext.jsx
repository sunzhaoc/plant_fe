// src/context/AuthContext.jsx
import {createContext, useContext, useState, useEffect} from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    // 检查本地存储中的用户状态
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    // 登录函数
    const login = async (email, password) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });

            if (!response.ok) throw new Error('登录失败');

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return true;
        } catch (error) {
            console.error('登录失败:', error);
            return false;
        }
    };

    // 注册函数
    const register = async (username, email, password) => {
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({username, email, password})
            });

            if (!response.ok) throw new Error('注册失败');

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('注册失败:', error);
            return false;
        }
    };

    // 退出登录
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        fetch('/api/logout', {method: 'POST'});
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