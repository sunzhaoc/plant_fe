import {RingLoader} from 'react-spinners';

// 定义可复用的加载组件
const LoadingSpinner = ({
                            text = '正在加载中...',
                            color = '#4CAF50',
                            size = 50,
                            speedMultiplier = 1,
                            minHeight = '80vh',
                            fontSize = '16px',
                            textColor = '#666'
                        }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: minHeight,
                gap: '16px'
            }}>
            <RingLoader
                color={color}
                size={size}
                speedMultiplier={speedMultiplier}
            />
            <p style={{fontSize: fontSize, color: textColor}}>{text}</p>
        </div>
    );
};

// 导出组件供其他文件使用
export default LoadingSpinner;