import {useState, useEffect} from 'react';
import {useAuth} from '/src/context/AuthContext';
import styles from '/src/components/Auth/AuthModal.module.css';
import {Eye, EyeOff} from 'lucide-react';
import toast from "react-hot-toast";

export default function AuthModal() {
    const {
        authModalOpen, setAuthModalOpen,
        isLoginMode, setIsLoginMode,
        isForgotPasswordMode, setIsForgotPasswordMode,
        login, register,
        sendVerificationCode, resetPassword
    } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false); // 控制新密码可见性
    const [countdown, setCountdown] = useState(0); // 验证码倒计时

    // 2. 扩展 FormData，增加 code 和 newPassword
    const [formData, setFormData] = useState({
        account: '', // 用于登录（用户名/手机/邮箱）
        username: '',   // 用于注册
        email: '',      // 用于注册
        password: '',   // 通用
        phone: '', // 用于注册
        verificationCode: '',
        newPassword: ''
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

    // 倒计时逻辑 Effect
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    if (!authModalOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setError('');
        setCountdown(0);
        setFormData({
            account: '',
            username: '',
            email: '',
            password: '',
            phone: '',
            verificationCode: '',
            newPassword: ''
        });
    };

    // 处理发送验证码
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
            // 重置成功后切回登录界面
            setIsForgotPasswordMode(false);
            setIsLoginMode(true);
            resetForm();
        } else {
            setError(message);
        }
    };

    // 4. 修改原有 handleSubmit，区分模式
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isForgotPasswordMode) {
            return; // 忘记密码模式走单独的 handleResetSubmit
        }

        if (isLoginMode) {
            // 登录逻辑：校验账号和密码
            if (!formData.account || !formData.password) {
                setError('请输入账号和密码');
                return;
            }
            const {success, message} = await login(formData.account, formData.password);
            if (success) {
                setAuthModalOpen(false);
                toast.success("登录成功");
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
                if (loginRes.success) setAuthModalOpen(false);
                else {
                    setIsLoginMode(true);
                    setError('注册成功，请手动登录');
                }
            } else {
                setError(message);
            }
        }
    };

    // 5. 渲染辅助函数：切换回登录
    const goBackToLogin = () => {
        setIsForgotPasswordMode(false);
        setIsLoginMode(true);
        resetForm();
    };

    return (
        <div className={styles.authOverlay} onClick={() => setAuthModalOpen(false)}>
            <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.authHeader}>
                    <h2>
                        {isForgotPasswordMode ? '重置密码' : (isLoginMode ? '登录' : '注册')}
                    </h2>
                    <button
                        className={styles.closeBtn}
                        onClick={() => setAuthModalOpen(false)}
                    >
                        <i className="bi bi-x"></i>
                    </button>
                </div>

                {error && <div className={styles.authError}>{error}</div>}

                {isForgotPasswordMode ? (
                    // 忘记密码表单
                    <form onSubmit={handleResetSubmit} className={styles.authForm}>
                        {/* 1. 邮箱输入 */}
                        <div className={styles.formGroup}>
                            <label htmlFor="reset-email">注册邮箱</label>
                            <input
                                type="email" id="reset-email" name="email"
                                value={formData.email} onChange={handleChange} required
                                placeholder="请输入注册时的邮箱"
                            />
                        </div>

                        {/* 2. 验证码 */}
                        <div className={styles.formGroup}>
                            <label>验证码</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input
                                    type="text" name="verificationCode"
                                    value={formData.verificationCode} onChange={handleChange} required
                                    placeholder="输入验证码" style={{flex: 1}}
                                />
                                <button
                                    type="button" onClick={handleSendCode}
                                    disabled={countdown > 0}
                                    // 简单的内联样式，你可以移到 css module 里
                                    style={{
                                        padding: '0 15px',
                                        whiteSpace: 'nowrap',
                                        background: countdown > 0 ? '#ccc' : '#007bff',
                                        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                                    }}
                                >
                                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                                </button>
                            </div>
                        </div>

                        {/* 3. 新密码 */}
                        <div className={styles.formGroup}>
                            <label htmlFor="new-password">新密码</label>
                            <div className="password-input-wrapper" style={{position: 'relative'}}>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    id="new-password" name="newPassword"
                                    value={formData.newPassword} onChange={handleChange}
                                    placeholder="设置新密码 (至少6位)" required minLength={6}
                                    style={{width: '100%', paddingRight: '40px'}}
                                />
                                <button
                                    type="button" onClick={() => setShowNewPassword(!showNewPassword)}
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
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.authBtn}>确认重置</button>
                    </form>
                ) : (
                    // 原有视图：登录/注册表单 (保持原样，仅修改底部切换链接)
                    <form
                        onSubmit={handleSubmit} className={styles.authForm}
                        key={isLoginMode ? 'login-form' : 'register-form'}>
                        {/* 登录模式：仅显示账号 + 密码 */}
                        {isLoginMode ? (
                            <div className={styles.formGroup}>
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
                                <div className={styles.formGroup}>
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
                                <div className={styles.formGroup}>
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
                                <div className={styles.formGroup}>
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
                        {!isForgotPasswordMode && (
                            <div className={styles.formGroup}>
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
                        )}

                        <button type="submit" className={styles.authBtn}>
                            {isLoginMode ? '登录' : '注册'}
                        </button>
                    </form>
                )}

                {/* 底部切换区域 */}
                <div className={styles.authSwitch}>
                    {isForgotPasswordMode ? (
                        // 忘记密码模式下：显示返回登录
                        <button onClick={goBackToLogin} className={styles.switchLink}>
                            ← 返回登录
                        </button>
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
                                {/* 忘记密码入口 */}
                                <button
                                    onClick={() => {
                                        setIsForgotPasswordMode(true);
                                        resetForm();
                                    }}
                                    className={styles.switchLink} style={{marginTop: '5px', fontSize: '0.9em'}}>
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