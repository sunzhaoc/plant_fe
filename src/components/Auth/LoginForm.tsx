import React from 'react';
import PasswordInput from 'src/components/Auth/common/PasswordInput.tsx';
import styles from 'src/components/Auth/AuthModal.module.css';

// 定义表单数据类型
interface LoginFormData {
    account: string;
    password: string;
}

// 定义组件Props类型
interface LoginFormProps {
    formData: LoginFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/**
 * 登录表单组件
 */
export default function LoginForm({formData, onChange, onSubmit}: LoginFormProps) {
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
                    onInvalid={(e) => {
                        // 断言为HTMLInputElement以访问validity属性
                        const target = e.target as HTMLInputElement;
                        if (target.validity.valueMissing) {
                            target.setCustomValidity('请输入账号');
                        } else {
                            target.setCustomValidity('');
                        }
                    }}
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.setCustomValidity("");
                    }}
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
                    minLength={6}
                    maxLength={20}
                />
            </div>

            <button type="submit" className={styles.authBtn}>登录</button>
        </form>
    );
}