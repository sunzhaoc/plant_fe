import {useNavigate} from "react-router-dom";
import {useState} from "react";
import api from "src/utils/api.tsx";
import toast from 'react-hot-toast';
import {AuthContext, AuthContextValue, User} from 'src/context/AuthContext.tsx';
import React from "react";
import type {AxiosError} from 'axios';

export const AuthProvider = ({children}: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                return JSON.parse(savedUser) as User;
            } catch (e) {
                localStorage.removeItem('user');
                return null;
            }
        }
        return null;
    });

    const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState<boolean>(false);

    // 登录函数
    const login = async (account: string, password: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            const response = await api.post('/api/login', {account, password});
            const userData = response.data.user as User;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            let errMsg = "登录失败，请稍后重试！";
            if (error instanceof Error && (error as AxiosError).response) {
                const axiosError = error as AxiosError<{ message: string }>;
                errMsg = axiosError.response?.data?.message || errMsg;
            }
            return {
                success: false,
                message: errMsg,
            };
        }
    };

    // 注册函数
    const register = async (username: string, email: string, password: string, phone: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            const response = await api.post('/api/register', {username, email, password, phone});
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            let errMsg = "注册失败，请稍后重试！";
            if (error instanceof Error && (error as AxiosError).response) {
                const axiosError = error as AxiosError<{ message: string }>;
                errMsg = axiosError.response?.data?.message || errMsg;
            }
            return {
                success: false,
                message: errMsg,
            };
        }
    };

    // 退出登录
    const logout = async (): Promise<void> => {
        setUser(null);
        localStorage.removeItem('user');
        toast.success("已退出");
        navigate('/'); // 退出后强制跳转到首页，防止停留在敏感页面
    };

    // 发送验证码
    const sendVerificationCode = async (email: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            await api.post('/api/forgot-password/send-code', {email});
            return {success: true, message: '验证码已发送，请查收邮箱'};
        } catch (error) {
            let errMsg = "发送失败，请稍后重试";
            if (error instanceof Error && (error as AxiosError).response) {
                const axiosError = error as AxiosError<{ message: string }>;
                errMsg = axiosError.response?.data?.message || errMsg;
            }
            return {success: false, message: errMsg};
        }
    };

    // 重置密码
    const resetPassword = async (email: string, code: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }> => {
        try {
            await api.post('/api/forgot-password/reset', {email, code, newPassword});
            return {success: true, message: '密码重置成功，请使用新密码登录'};
        } catch (error) {
            let errMsg = "重置失败，验证码可能已过期";
            if (error instanceof Error && (error as AxiosError).response) {
                const axiosError = error as AxiosError<{ message: string }>;
                errMsg = axiosError.response?.data?.message || errMsg;
            }
            return {success: false, message: errMsg};
        }
    };

    const contextValue: AuthContextValue = {
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
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};