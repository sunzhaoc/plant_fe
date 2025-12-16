import { useState, useEffect } from 'react'; // 新增导入useEffect
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

    // 核心：背景滚动锁定逻辑
    useEffect(() => {
        const body = document.body;
        if (authModalOpen) {
            // 1. 保存当前滚动位置，防止锁定后页面跳顶
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            // 2. 保存原始overflow样式，用于恢复
            const originalOverflow = body.style.overflow;

            // 3. 锁定背景：禁止滚动 + 固定定位防止位移
            body.style.overflow = 'hidden';
            body.style.position = 'fixed';
            body.style.width = '100%';
            body.style.top = `-${scrollTop}px`;

            // 4. 把原始状态存到body的data属性里，方便恢复
            body.dataset.originalOverflow = originalOverflow;
            body.dataset.scrollTop = scrollTop;
        } else {
            // 恢复背景滚动
            const originalOverflow = body.dataset.originalOverflow || '';
            const scrollTop = parseInt(body.dataset.scrollTop || '0', 10);

            // 重置body样式
            body.style.overflow = originalOverflow;
            body.style.position = '';
            body.style.width = '';
            body.style.top = '';

            // 恢复之前的滚动位置
            window.scrollTo(0, scrollTop);

            // 清理data属性
            delete body.dataset.originalOverflow;
            delete body.dataset.scrollTop;
        }

        // 组件卸载时兜底恢复（防止异常情况导致背景一直锁定）
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
    }, [authModalOpen]); // 仅监听弹窗显示状态变化

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