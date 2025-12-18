import {useNavigate} from "react-router-dom";
import {useState} from "react";
import api from "@/utils/api.jsx";
import {message} from "antd";
import {AuthContext} from '/src/context/AuthContext.jsx'

export const AuthProvider = ({children}) => {
    const navigate = useNavigate();
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
        // account 可以是邮箱/手机/用户名
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
        message.success("已退出成功");
        navigate('/'); // 退出后强制跳转到首页，防止停留在敏感页面
    };

    return (<AuthContext.Provider
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
    </AuthContext.Provider>);
};