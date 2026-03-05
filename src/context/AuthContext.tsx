import {createContext, useContext, Dispatch, SetStateAction} from 'react';

export interface User {
    id?: string;
    username?: string;
    email?: string;
    phone?: string;
}

export interface AuthContextValue {
    user: User | null;
    authModalOpen: boolean;
    setAuthModalOpen: Dispatch<SetStateAction<boolean>>;
    isLoginMode: boolean;
    setIsLoginMode: Dispatch<SetStateAction<boolean>>;
    isForgotPasswordMode: boolean;
    setIsForgotPasswordMode: Dispatch<SetStateAction<boolean>>;
    login: (account: string, password: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    register: (username: string, email: string, password: string, phone: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    logout: () => Promise<void>;
    sendVerificationCode: (email: string) => Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<{
        success: boolean;
        message: string;
    }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};