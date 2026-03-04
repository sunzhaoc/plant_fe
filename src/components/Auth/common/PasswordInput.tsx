import {useState} from 'react';
import type {InputHTMLAttributes} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import styles from 'src/components/Auth/AuthModal.module.css';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
}

export default function PasswordInput(props: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.passwordInputWrapper}>
            <input
                type={showPassword ? "text" : "password"}
                {...props}
                className={styles.formInput} // 确保样式统一
                style={{paddingRight: '40px'}}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggleBtn}
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}