// src/components/Modal/PrizeModal.tsx
import { useEffect, useState, useRef } from 'react';
import styles from './PrizeModal.module.css';
import api from "src/utils/api.tsx";
import { plantImageApi } from "src/services/api.tsx";

interface PrizeModalProps {
    onClose?: () => void;
}

// 1. 补充后端返回的字段（重点添加 win_code 中奖码字段）
interface LotteryDrawRes {
    success: boolean;
    is_win: boolean;
    message: string;
    today_count?: number;
    hour_count: number;       // 当前小时抽奖次数
    current_hour: string;     // 当前小时
    win_code: string;         // 中奖码（核心新增）
}

const fetchLotteryResult = async (): Promise<LotteryDrawRes | null> => {
    try {
        const res = await api.get<LotteryDrawRes>('/api/gift/get-today-lottery-draw', {});
        return res.data;
    } catch (err) {
        console.error('请求抽奖接口失败：', err);
        return null;
    }
};

export default function PrizeModal({ onClose }: PrizeModalProps) {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [weChatQrCodeUrl, setWeChatQrcodeUrl] = useState('');
    const [lotteryResult, setLotteryResult] = useState<LotteryDrawRes | null>(null); // 2. 保存抽奖结果状态
    const isUnmounted = useRef(false);

    useEffect(() => {
        const getWeChatQrcodeUrl = async () => {
            try {
                const url = await plantImageApi.getPlantImage('plant/website/jietu-1767083270070.jpg?image_process=resize,h_280,w_280');
                if (!isUnmounted.current) {
                    setWeChatQrcodeUrl(url);
                }
            } catch (err) {
                console.error('获取老板微信二维码失败：', err);
            }
        };
        void getWeChatQrcodeUrl();

        return () => {
            isUnmounted.current = true;
        };
    }, []);

    useEffect(() => {
        const initModal = async () => {
            // 注：原注释写10%概率，但代码是100%调用后端，如需10%则改为 randomRate <= 0.1
            const randomRate = Math.random();
            let lotteryResult: LotteryDrawRes | null = null;

            if (randomRate <= 1) {
                lotteryResult = await fetchLotteryResult();
            } else {
                // 本地模拟时也要补充 win_code 字段
                lotteryResult = {
                    success: true,
                    is_win: false,
                    message: '未中奖',
                    today_count: 0,
                    hour_count: 0,
                    current_hour: '',
                    win_code: '' // 非中奖时为空
                };
            }

            // 兜底处理：接口请求失败时补充默认值
            if (!lotteryResult) {
                lotteryResult = {
                    success: true,
                    is_win: false,
                    message: '抽奖请求失败',
                    today_count: 0,
                    hour_count: 0,
                    current_hour: '',
                    win_code: ''
                };
            }

            // 3. 保存抽奖结果到状态
            setLotteryResult(lotteryResult);
            // 根据结果控制弹窗显示
            setShow(lotteryResult.success && lotteryResult.is_win);
            setLoading(false);
        };
        initModal();
    }, []);

    const closeModal = () => {
        setShow(false);
        onClose?.();
    };

    // 加载中/未中奖/无结果时不渲染弹窗
    if (loading || !show || !lotteryResult) return null;

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.modalCloseBtn} onClick={closeModal}>
                    ×
                </button>

                <h2 className={styles.title}>🎉 恭喜您！已中奖 🎉</h2>
                <p className={styles.tipText}>感谢您的参与，幸运好礼等你领取～</p>

                {/* 4. 展示中奖码（核心新增） */}
                <div className={styles.winCodeSection}>
                    <p className={styles.winCodeLabel}>您的中奖码：</p>
                    <div className={styles.winCodeValue}>{lotteryResult.win_code}</div>
                    <p className={styles.winCodeTip}>请凭此码联系老板核对领奖信息</p>
                </div>

                <div className={styles.qrcodeSection}>
                    <div className={styles.qrcodeWrapper}>
                        <div className={styles.qrcodeCard}>
                            <div className={styles.qrcodeImgBox}>
                                <img
                                    src={weChatQrCodeUrl}
                                    alt="老板微信二维码"
                                    className={styles.qrcodeImg}
                                />
                            </div>
                            <p className={styles.qrcodeLabel}>
                                <i className="bi bi-chat-dots"></i>
                                <span>老板微信</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}