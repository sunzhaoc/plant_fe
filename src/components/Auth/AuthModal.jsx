import React, {useState, useEffect} from 'react';
import {useAuth} from '/src/context/AuthContext';
import toast from "react-hot-toast";
import styles from '/src/components/Auth/AuthModal.module.css';

import LoginForm from '/src/components/Auth/LoginForm';
import RegisterForm from '/src/components/Auth/RegisterForm';
import ForgotPasswordForm from '/src/components/Auth/ForgotPasswordForm';

export default function AuthModal() {
    const {
        authModalOpen, setAuthModalOpen,
        isLoginMode, setIsLoginMode,
        isForgotPasswordMode, setIsForgotPasswordMode,
        login, register,
        sendVerificationCode, resetPassword
    } = useAuth();

    const [countdown, setCountdown] = useState(0); // 验证码倒计时
    const [error, setError] = useState('');

    // 初始化表单数据
    const initialFormData = {
        account: '', // 用于登录（用户名/手机/邮箱）
        username: '', // 用于注册
        email: '', // 用于注册
        password: '', // 通用
        phone: '', // 用于注册
        verificationCode: '', // 忘记密码验证码
        newPassword: '' // 新密码
    };
    const [formData, setFormData] = useState(initialFormData);

    // 背景滚动锁定
    useEffect(() => {
        const body = document.body;
        if (authModalOpen) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const originalOverflow = body.style.overflow;

            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.top = `-${scrollTop}px`;

            body.dataset.originalOverflow = originalOverflow;
            body.dataset.scrollTop = scrollTop;
        } else {
            const originalOverflow = body.dataset.originalOverflow || '';
            const scrollTop = parseInt(body.dataset.scrollTop || '0', 10);

            body.style.overflow = originalOverflow;
            body.style.position = '';
            body.style.width = '';
            body.style.top = '';

            window.scrollTo(0, scrollTop);

            delete body.dataset.originalOverflow;
            delete body.dataset.scrollTop;
        }

        return () => {
            const body = document.body;
            body.style.overflow = body.dataset.originalOverflow || '';
            body.style.position = '';
            body.style.width = '';
            body.style.top = '';
            window.scrollTo(0, parseInt(body.dataset.scrollTop || '0', 10));
            delete body.dataset.originalOverflow;
            delete body.dataset.scrollTop;
        };
    }, [authModalOpen]);

    // 倒计时 Effect
    useEffect(() => {
        let timer;
        if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const resetForm = () => {
        setError('');
        setCountdown(0);
        setFormData(initialFormData);
    };

    // 切换回登录
    const goBackToLogin = () => {
        setIsForgotPasswordMode(false);
        setIsLoginMode(true);
        resetForm();
    };

    // 关闭 Modal
    const closeModal = () => {
        setAuthModalOpen(false);
        resetForm();
    };

    const handleSendCode = async () => {
        if (!formData.email) {
            setError('请先输入邮箱地址');
            return;
        }
        setError('');
        const res = await sendVerificationCode(formData.email);
        if (res.success) {
            toast.success(res.message);
            setCountdown(60); // 开启60秒倒计时
        } else {
            setError(res.message);
        }
    };

    // 处理重置密码提交
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.verificationCode || !formData.newPassword) {
            setError('请填写所有字段');
            return;
        }
        if (formData.newPassword.length < 6) {
            setError('密码长度至少6位');
            return;
        }

        const {success, message} = await resetPassword(
            formData.email,
            formData.verificationCode,
            formData.newPassword
        );
        if (success) {
            toast.success(message);
            goBackToLogin();
        } else {
            setError(message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLoginMode) {
            // 登录逻辑
            if (!formData.account || !formData.password) {
                setError('请输入账号和密码');
                return;
            }
            const {success, message} = await login(formData.account, formData.password);
            if (success) {
                closeModal();
                toast.success("登录成功");
            } else {
                setError(message);
            }
        } else {
            // 注册逻辑
            if (!formData.username || !formData.email || !formData.password || !formData.phone) {
                setError('请填写所有字段');
                return;
            }

            if (formData.password.length < 6) {
                setError('密码长度至少6位');
                return;
            }
            const {success, message} = await register(
                formData.username, formData.email, formData.password, formData.phone
            );
            if (success) {
                const loginRes = await login(formData.email, formData.password);
                if (loginRes.success) closeModal();
                else {
                    setIsLoginMode(true);
                    setError('注册成功，请手动登录');
                }
            } else {
                setError(message);
            }
        }
    };

    // 渲染 ---
    if (!authModalOpen) return null;

    // 决定当前渲染哪个表单
    const renderContent = () => {
        if (isForgotPasswordMode) {
            return (
                <ForgotPasswordForm
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleResetSubmit}
                    onSendCode={handleSendCode}
                    error={error}
                    countdown={countdown}
                />
            );
        }

        return isLoginMode ? (
            <LoginForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                error={error}
            />
        ) : (
            <RegisterForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                error={error}
            />
        );
    };

    return (
        <div className={styles.authOverlay} onClick={closeModal}>
            <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
                {/* 头部 */}
                <div className={styles.authHeader}>
                    <h2>
                        {isForgotPasswordMode ? '重置密码' : (isLoginMode ? '登录' : '注册')}
                    </h2>
                    <button className={styles.closeBtn} onClick={closeModal}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                {/* 错误提示 */}
                {error && <div className={styles.authError}>{error}</div>}

                {/* 动态内容区域 */}
                {renderContent()}

                {/* 底部切换区域 */}
                <div className={styles.authSwitch}>
                    {isForgotPasswordMode ? (
                        <button onClick={goBackToLogin} className={styles.switchLink}>← 返回登录</button>
                    ) : (
                        isLoginMode ? (
                            <>
                                还没有账号？{' '}
                                <button
                                    onClick={() => {
                                        setIsLoginMode(false);
                                        resetForm();
                                    }}
                                    className={styles.switchLink}
                                >
                                    立即注册
                                </button>
                                <br />
                                <button
                                    onClick={() => {
                                        setIsForgotPasswordMode(true);
                                        resetForm();
                                    }}
                                    className={styles.switchLink}
                                >
                                    忘记密码？
                                </button>
                            </>
                        ) : (
                            <>
                                已有账号？{' '}
                                <button
                                    onClick={() => {
                                        setIsLoginMode(true);
                                        resetForm();
                                    }}
                                    className={styles.switchLink}
                                >
                                    立即登录
                                </button>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}