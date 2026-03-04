import React from 'react';
import PasswordInput from 'src/components/Auth/common/PasswordInput.jsx';
import SendCodeButton from 'src/components/Auth/common/SendCodeButton.jsx';
import styles from 'src/components/Auth/AuthModal.module.css';

/**
 * 忘记密码表单组件
 */
export default function ForgotPasswordForm({
                                               formData,
                                               onChange,
                                               onSubmit,
                                               onSendCode,
                                               countdown
                                           }) {
    return (
        <form onSubmit={onSubmit} className={styles.authForm}>
            {/* 邮箱输入 */}
            <div className={styles.formGroup}>
                <label htmlFor="reset-email">注册邮箱</label>
                <input
                    type="email"
                    id="reset-email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                    maxLength="255"
                    className={styles.formInput}
                    placeholder="请输入注册时的邮箱"
                    autoComplete="email"
                    pattern="^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$"
                    onInvalid={(e) => {
                        if (e.target.validity.valueMissing) {
                            e.target.setCustomValidity('请输入注册时的邮箱');
                        } else if (e.target.validity.patternMismatch) {
                            e.target.setCustomValidity('请输入正确的邮箱格式');
                        } else {
                            e.target.setCustomValidity('');
                        }
                    }}
                    onInput={(e) => e.target.setCustomValidity("")}
                />
            </div>

            {/* 验证码 (使用复用组件) */}
            <div className={styles.formGroup}>
                <label htmlFor="verificationCode">验证码</label>
                <div className={styles.codeInputGroup}>
                    <input
                        type="text"
                        id="verificationCode"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={onChange}
                        required
                        maxLength="6"
                        minLength="6"
                        className={styles.formInput}
                        placeholder="输入6位验证码"
                        autoComplete="one-time-code"
                        pattern="\d{6}"
                        inputMode="numeric"
                        onInvalid={(e) => {
                            if (e.target.validity.valueMissing) {
                                e.target.setCustomValidity('请输入验证码');
                            } else if (e.target.validity.patternMismatch || e.target.validity.tooShort) {
                                e.target.setCustomValidity('请输入6位数字验证码');
                            } else {
                                e.target.setCustomValidity('');
                            }
                        }}
                        onInput={(e) => e.target.setCustomValidity("")}
                    />
                    <SendCodeButton
                        countdown={countdown}
                        onClick={onSendCode}
                    />
                </div>
            </div>

            {/* 新密码 (使用复用组件) */}
            <div className={styles.formGroup}>
                <label htmlFor="new-password">新密码</label>
                <PasswordInput
                    id="new-password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={onChange}
                    placeholder="6-20位密码（支持字母、数字、符号）"
                    required
                    minLength={6}
                    maxLength={20}
                    autoComplete="new-password"
                />
            </div>

            <button type="submit" className={styles.authBtn}>确认重置</button>
        </form>
    );
}