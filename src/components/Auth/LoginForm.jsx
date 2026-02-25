import React from 'react';
import PasswordInput from '/src/components/Auth/common/PasswordInput.jsx';
import styles from '/src/components/Auth/AuthModal.module.css';

/**
 * 登录表单组件
 */
export default function LoginForm({formData, onChange, onSubmit}) {
    return (
        <form onSubmit={onSubmit} className={styles.authForm} key="login-form">
            {/* 账号输入 */}
            <div className={styles.formGroup}>
                <label htmlFor="account">账号</label>
                <input
                    type="text"
                    id="account"
                    name="account"
                    value={formData.account}
                    onChange={onChange}
                    required
                    placeholder="请输入用户名/邮箱/手机号"
                    autoComplete="username"
                    className={styles.formInput}
                />
            </div>

            {/* 密码输入 (使用复用组件) */}
            <div className={styles.formGroup}>
                <label htmlFor="password">密码</label>
                <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    required
                />
            </div>

            <button type="submit" className={styles.authBtn}>登录</button>
        </form>
    );
}