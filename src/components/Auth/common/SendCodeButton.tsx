import styles from 'src/components/Auth/AuthModal.module.css';

interface SendCodeButtonProps {
    countdown: number;
    onClick: () => void;
    disabled: boolean;
}

export default function SendCodeButton({
                                           countdown,
                                           onClick,
                                           disabled
                                       }: SendCodeButtonProps) {
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