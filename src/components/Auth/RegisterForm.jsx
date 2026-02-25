import React from 'react';
import PasswordInput from '/src/components/Auth/common/PasswordInput.jsx';
import styles from '/src/components/Auth/AuthModal.module.css';

/**
 * 注册表单组件
 */
export default function RegisterForm({formData, onChange, onSubmit}) {
    return (
        <form onSubmit={onSubmit} className={styles.authForm} key="register-form">
            {/* 用户名 */}
            <div className={styles.formGroup}>
                <label htmlFor="username">用户名</label>
                <input
                    type="text" id="username" name="username"
                    value={formData.username} onChange={onChange} required
                    className={styles.formInput} placeholder="请输入用户名"
                />
            </div>

            {/* 手机号 */}
            <div className={styles.formGroup}>
                <label htmlFor="phone">手机号</label>
                <input
                    type="tel" id="phone" name="phone"
                    value={formData.phone} onChange={onChange} required
                    className={styles.formInput} placeholder="请输入手机号"
                />
            </div>

            {/* 邮箱 */}
            <div className={styles.formGroup}>
                <label htmlFor="email">邮箱</label>
                <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={onChange} required
                    className={styles.formInput} placeholder="请输入邮箱地址"
                />
            </div>

            {/* 密码 */}
            <div className={styles.formGroup}>
                <label htmlFor="password">密码</label>
                <PasswordInput
                    id="password" name="password"
                    value={formData.password} onChange={onChange}
                    placeholder="设置密码 (至少6位)" required
                    autoComplete="new-password"
                />
            </div>

            <button type="submit" className={styles.authBtn}>注册</button>
        </form>
    );
}