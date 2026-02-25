import React from 'react';
import PasswordInput from '/src/components/Auth/common/PasswordInput.jsx';
import SendCodeButton from '/src/components/Auth/common/SendCodeButton.jsx';
import styles from '/src/components/Auth/AuthModal.module.css';

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
                    type="email" id="reset-email" name="email"
                    value={formData.email} onChange={onChange} required
                    className={styles.formInput} placeholder="请输入注册时的邮箱"
                />
            </div>

            {/* 验证码 (使用复用组件) */}
            <div className={styles.formGroup}>
                <label>验证码</label>
                <div className={styles.codeInputGroup}>
                    <input
                        type="text" name="verificationCode"
                        value={formData.verificationCode} onChange={onChange} required
                        className={styles.formInput} placeholder="输入验证码"
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
                    id="new-password" name="newPassword"
                    value={formData.newPassword} onChange={onChange}
                    placeholder="设置新密码 (至少6位)" required
                />
            </div>

            <button type="submit" className={styles.authBtn}>确认重置</button>
        </form>
    );
}