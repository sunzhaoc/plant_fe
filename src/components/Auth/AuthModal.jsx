import {useState, useEffect} from 'react';
import {useAuth} from '/src/context/AuthContext';
import './AuthModal.css';
import {Eye, EyeOff} from 'lucide-react';

export default function AuthModal() {
    const {
        authModalOpen,
        setAuthModalOpen,
        isLoginMode,
        setIsLoginMode,
        login,
        register
    } = useAuth();

    const [showPassword, setShowPassword] = useState(false);


    const [formData, setFormData] = useState({
        account: '', // 用于登录（用户名/手机/邮箱）
        username: '',   // 用于注册
        email: '',      // 用于注册
        password: '',   // 通用
        phone: ''       // 用于注册
    });

    const [error, setError] = useState('');

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

    if (!authModalOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setError('');
        setFormData({
            account: '',
            username: '',
            email: '',
            password: '',
            phone: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLoginMode) {
            // 登录逻辑：校验账号和密码
            if (!formData.account || !formData.password) {
                setError('请输入账号和密码');
                return;
            }
            const {success, message} = await login(formData.account, formData.password);
            if (success) {
                setAuthModalOpen(false);
            } else {
                setError(message);
            }
        } else {
            // --- 注册逻辑保持不变 ---
            if (!formData.username || !formData.email || !formData.password || !formData.phone) {
                setError('请填写所有字段');
                return;
            }

            if (formData.password.length < 6) {
                setError('密码长度至少6位');
                return;
            }

            const {success, message} = await register(
                formData.username,
                formData.email,
                formData.password,
                formData.phone
            );

            if (success) {
                // 注册成功则自动登录
                setError('');
                const loginRes = await login(formData.email, formData.password);
                if (loginRes.success) {
                    setAuthModalOpen(false); // 登录成功，关闭弹窗
                } else {
                    // 如果自动登录失败（理论上概率极低），则跳转到登录界面让用户手动登录
                    setIsLoginMode(true);
                    setError('注册成功，请手动登录');
                }
            } else {
                setError(message);
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

                <form onSubmit={handleSubmit} className="auth-form" key={isLoginMode ? 'login-form' : 'register-form'}>
                    {/* 登录模式：仅显示账号 + 密码 */}
                    {isLoginMode ? (
                        <div className="form-group">
                            <label htmlFor="account">账号</label>
                            <input
                                type="text"
                                id="account"
                                name="account"
                                value={formData.account}
                                onChange={handleChange}
                                required
                                placeholder="请输入用户名/邮箱/手机号"
                                autoComplete="username"
                                onInvalid={(e) => {
                                    if (e.target.validity.valueMissing) {
                                        e.target.setCustomValidity('请输入账号');
                                    } else {
                                        e.target.setCustomValidity('');
                                    }
                                }}
                                onInput={(e) => e.target.setCustomValidity("")}
                            />
                        </div>
                    ) : (
                        // 注册模式：显示完整字段（用户名+手机号+邮箱）
                        <>
                            {/* 用户名 */}
                            <div className="form-group">
                                <label htmlFor="username">用户名</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                    maxLength={20}
                                    placeholder="请输入用户名"
                                    autoComplete="username"
                                    pattern="[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]{2,19}"
                                    onInvalid={(e) => {
                                        if (e.target.validity.valueMissing) {
                                            e.target.setCustomValidity('请输入用户名');
                                        } else if (e.target.validity.patternMismatch) {
                                            e.target.setCustomValidity("3-20位，支持中文/字母/数字/下划线");
                                        } else {
                                            e.target.setCustomValidity('');
                                        }
                                    }}
                                    onInput={(e) => e.target.setCustomValidity("")}
                                />
                            </div>

                            {/* 手机号 */}
                            <div className="form-group">
                                <label htmlFor="phone">手机号</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    maxLength="11"
                                    minLength="11"
                                    placeholder="请输入手机号"
                                    pattern="^1[3-9]\d{9}$"
                                    inputMode="numeric"
                                    onInvalid={(e) => {
                                        if (e.target.validity.valueMissing) {
                                            e.target.setCustomValidity('请输入手机号');
                                        } else if (e.target.validity.patternMismatch) {
                                            e.target.setCustomValidity("请输入正确的11位手机号");
                                        } else {
                                            e.target.setCustomValidity('');
                                        }
                                    }}
                                    onInput={(e) => e.target.setCustomValidity("")}
                                />
                            </div>

                            {/* 邮箱 */}
                            <div className="form-group">
                                <label htmlFor="email">邮箱</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="请输入邮箱地址"
                                    maxLength="255"
                                    pattern="^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$"
                                    onInvalid={(e) => {
                                        if (e.target.validity.valueMissing) {
                                            e.target.setCustomValidity('请输入邮箱地址');
                                        } else if (e.target.validity.patternMismatch) {
                                            e.target.setCustomValidity("请输入正确的邮箱格式（如：antplant-store@gmail.com）");
                                        } else {
                                            e.target.setCustomValidity('');
                                        }
                                    }}
                                    onInput={(e) => e.target.setCustomValidity("")}
                                />
                            </div>
                        </>
                    )}

                    {/* 密码输入框：登录/注册共用 */}
                    <div className="form-group">
                        <label htmlFor="password">密码</label>
                        <div className="password-input-wrapper" style={{position: 'relative'}}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                autoComplete={isLoginMode ? "current-password" : "new-password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={isLoginMode ? "请输入密码" : "6-20位密码（支持字母、数字、符号）"}
                                minLength={6}
                                maxLength={20}
                                required
                                style={{width: '100%', paddingRight: '40px'}}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
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
                                onClick={() => {
                                    setIsLoginMode(false);
                                    resetForm();
                                }}
                                className="switch-link"
                            >
                                立即注册
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