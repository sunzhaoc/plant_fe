import React from 'react';
import PasswordInput from 'src/components/Auth/common/PasswordInput.tsx';
import styles from 'src/components/Auth/AuthModal.module.css';

// 定义表单数据类型
interface RegisterFormData {
    username: string;
    phone: string;
    email: string;
    password: string;
}

// 定义组件属性类型
interface RegisterFormProps {
    formData: RegisterFormData;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
}

/**
 * 注册表单组件
 */
export default function RegisterForm({formData, onChange, onSubmit}: RegisterFormProps) {
    return (
        <form onSubmit={onSubmit} className={styles.authForm} key="register-form">
            {/* 用户名 */}
            <div className={styles.formGroup}>
                <label htmlFor="username">用户名</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={onChange}
                    required
                    minLength={3}
                    maxLength={20}
                    className={styles.formInput}
                    placeholder="请输入用户名"
                    autoComplete="username"
                    pattern="[a-zA-Z_\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]{2,19}"
                    onInvalid={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.validity.valueMissing) {
                            target.setCustomValidity('请输入用户名');
                        } else if (target.validity.patternMismatch || target.validity.tooShort) {
                            target.setCustomValidity("3-20位，支持中文/字母/数字/下划线");
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

            {/* 手机号 */}
            <div className={styles.formGroup}>
                <label htmlFor="phone">手机号</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={onChange}
                    required
                    maxLength={11}
                    minLength={11}
                    className={styles.formInput}
                    placeholder="请输入手机号"
                    pattern="^1[3-9]\d{9}$"
                    inputMode="numeric"
                    onInvalid={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.validity.valueMissing) {
                            target.setCustomValidity('请输入手机号');
                        } else if (target.validity.patternMismatch) {
                            target.setCustomValidity("请输入正确的11位手机号");
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

            {/* 邮箱 */}
            <div className={styles.formGroup}>
                <label htmlFor="email">邮箱</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                    className={styles.formInput}
                    placeholder="请输入邮箱地址"
                    maxLength={255}
                    pattern="^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$"
                    autoComplete="email"
                    onInvalid={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.validity.valueMissing) {
                            target.setCustomValidity('请输入邮箱地址');
                        } else if (target.validity.patternMismatch) {
                            target.setCustomValidity("请输入正确的邮箱格式");
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

            {/* 密码 */}
            <div className={styles.formGroup}>
                <label htmlFor="password">密码</label>
                <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="设置密码 (6-20位)"
                    required
                    minLength={6}
                    maxLength={20}
                    autoComplete="new-password"
                />
            </div>

            <button type="submit" className={styles.authBtn}>注册</button>
        </form>
    );
}