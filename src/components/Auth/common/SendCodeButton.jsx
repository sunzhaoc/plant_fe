import React from 'react';
import styles from '/src/components/Auth/AuthModal.module.css';

/**
 * 发送验证码倒计时按钮
 * @param {number} props.countdown - 当前倒计时秒数，0 表示未开始
 * @param {function} props.onClick - 点击发送回调
 */
export default function SendCodeButton({countdown, onClick, disabled}) {
    const isDisabled = countdown > 0 || disabled;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className={styles.sendCodeBtn}
            style={{background: isDisabled ? '#ccc' : '#007bff'}}
        >
            {countdown > 0 ? `${countdown}s` : '发送验证码'}
        </button>
    );
}