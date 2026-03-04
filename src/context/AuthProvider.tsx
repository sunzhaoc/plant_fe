import {useNavigate} from "react-router-dom";
import {useState} from "react";
import api from "/src/utils/api.jsx";
import toast from 'react-hot-toast';
import {AuthContext} from 'src/context/AuthContext.jsx'

export const AuthProvider = ({children}) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                localStorage.removeItem('user');
                return null;
            }
        }
        return null;
    });
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

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
        toast.success("已退出");
        navigate('/'); // 退出后强制跳转到首页，防止停留在敏感页面
    };

    // 发送验证码
    const sendVerificationCode = async (email) => {
        try {
            await api.post('/api/forgot-password/send-code', {email});
            return {success: true, message: '验证码已发送，请查收邮箱'};
        } catch (error) {
            const errMsg = error.response?.data?.message || "发送失败，请稍后重试";
            return {success: false, message: errMsg};
        }
    };

    // 重置密码
    const resetPassword = async (email, code, newPassword) => {
        try {
            await api.post('/api/forgot-password/reset', {email, code, newPassword});
            return {success: true, message: '密码重置成功，请使用新密码登录'};
        } catch (error) {
            const errMsg = error.response?.data?.message || "重置失败，验证码可能已过期";
            return {success: false, message: errMsg};
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
                isForgotPasswordMode,
                setIsForgotPasswordMode,
                login,
                register,
                logout,
                sendVerificationCode,
                resetPassword
            }}>
            {children}
        </AuthContext.Provider>
    );
};