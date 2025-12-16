// src/components/Auth/AuthModal.jsx
import { useState } from 'react';
import { useAuth } from '/src/context/AuthContext';
import './AuthModal.css';

export default function AuthModal() {
    const {
        authModalOpen,
        setAuthModalOpen,
        isLoginMode,
        setIsLoginMode,
        login,
        register
    } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    if (!authModalOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLoginMode) {
            // 登录逻辑
            if (!formData.email || !formData.password) {
                setError('请输入邮箱和密码');
                return;
            }

            const success = await login(formData.email, formData.password);
            if (success) {
                setAuthModalOpen(false);
            } else {
                setError('邮箱或密码错误');
            }
        } else {
            // 注册逻辑
            if (!formData.username || !formData.email || !formData.password) {
                setError('请填写所有字段');
                return;
            }

            if (formData.password.length < 6) {
                setError('密码长度至少6位');
                return;
            }

            const success = await register(
                formData.username,
                formData.email,
                formData.password
            );

            if (success) {
                setError('');
                setIsLoginMode(true);
                alert('注册成功，请登录');
            } else {
                setError('注册失败，请稍后再试');
            }
        }
    };

    return (
        <div className="auth-overlay" onClick={() => setAuthModalOpen(false)}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <div className="auth-header">
                    <h2>{isLoginMode ? '登录' : '注册'}</h2>
                    <button
                        className="close-btn"
                        onClick={() => setAuthModalOpen(false)}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLoginMode && (
                        <div className="form-group">
                            <label htmlFor="username">用户名</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">邮箱</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn">
                        {isLoginMode ? '登录' : '注册'}
                    </button>
                </form>

                <div className="auth-switch">
                    {isLoginMode ? (
                        <>
                            还没有账号？{' '}
                            <button
                                onClick={() => setIsLoginMode(false)}
                                className="switch-link"
                            >
                                立即注册
                            </button>
                        </>
                    ) : (
                        <>
                            已有账号？{' '}
                            <button
                                onClick={() => setIsLoginMode(true)}
                                className="switch-link"
                            >
                                立即登录
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}