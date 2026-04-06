// src/components/Modal/PrizeModal.tsx
import {useEffect, useState, useRef} from 'react';
import styles from './PrizeModal.module.css';
import api from "src/utils/api.tsx";
import {plantImageApi} from "src/services/api.tsx";

/**
 * 中奖弹窗组件
 * 功能：展示用户抽奖中奖结果、中奖码，以及联系领奖的微信二维码
 * @param {Object} props - 组件属性
 * @param {() => void} [props.onClose] - 弹窗关闭时的回调函数
 * @returns {JSX.Element | null} 渲染的弹窗组件（加载中/未中奖时返回null）
 */
interface PrizeModalProps {
    onClose?: () => void;
}

/**
 * 抽奖接口返回数据类型定义
 * @interface LotteryDrawRes
 * @property {boolean} success - 接口请求是否成功
 * @property {boolean} is_win - 是否中奖
 * @property {string} message - 接口返回提示信息
 * @property {number} [today_count] - 今日抽奖次数（可选）
 * @property {number} hour_count - 当前小时内抽奖次数
 * @property {string} current_hour - 当前小时（格式如："14"）
 * @property {string} win_code - 中奖码（中奖时返回有效字符串，未中奖为空）
 */
interface LotteryDrawRes {
    success: boolean;
    is_win: boolean;
    message: string;
    today_count?: number;
    hour_count: number;
    current_hour: string;
    win_code: string;
}

const WINNING_PROBABILITY = 1;
// const WINNING_START_TIME = new Date('2026-04-06T16:58:00+08:00');
const WINNING_START_TIME = new Date('2026-04-06T18:00:00+08:00');
const LAST_TRIGGER_DATETIME_KEY = 'lastLotteryTriggerDateTime';

/**
 * 工具函数：获取当前「日期+小时」标识（格式：YYYYMMDD-HH）
 * 作用：精准区分不同日期的同一小时（如20250523-14 和 20250524-14）
 */
const getCurrentDateHour = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份补零（1月→01）
    const day = String(now.getDate()).padStart(2, '0'); // 日期补零（5号→05）
    const hour = String(now.getHours()).padStart(2, '0'); // 小时补零（9点→09）
    return `日常抽奖活动260331-${year}${month}${day}${hour}`;
};

/**
 * 请求抽奖结果接口
 * @async
 * @function fetchLotteryResult
 * @returns {Promise<LotteryDrawRes | null>} 抽奖结果（失败返回null）
 */
const fetchLotteryResult = async (): Promise<LotteryDrawRes | null> => {
    try {
        // 调用抽奖接口，获取今日抽奖结果
        const res = await api.get<LotteryDrawRes>('/api/gift/get-today-lottery-draw', {});
        return res.data;
    } catch (err) {
        console.error('【中奖弹窗】请求抽奖接口失败：', err);
        return null;
    }
};

/**
 * 中奖弹窗核心组件
 * @param {PrizeModalProps} props - 组件属性
 * @returns {JSX.Element | null} 渲染结果
 */
export default function PrizeModal({onClose}: PrizeModalProps) {
    // 控制弹窗是否显示（仅中奖时显示）
    const [isModalShow, setIsModalShow] = useState(false);
    // 接口请求/二维码加载中的状态
    const [isLoading, setIsLoading] = useState(true);
    // 老板微信二维码图片地址
    const [weChatQrCodeUrl, setWeChatQrcodeUrl] = useState('');
    // 抽奖结果数据
    const [lotteryResult, setLotteryResult] = useState<LotteryDrawRes | null>(null);
    // 防止组件卸载后执行状态更新的标记
    const isUnmounted = useRef(false);

    /**
     * 初始化微信二维码
     * 作用：从CDN获取预设的微信二维码图片地址
     */
    useEffect(() => {
        const getWeChatQrcodeUrl = async () => {
            try {
                // 调用图片API获取二维码地址（指定尺寸280x280）
                const qrCodeUrl = await plantImageApi.getPlantImage(
                    'plant/website/jietu-1767083270070.jpg?image_process=resize,h_280,w_280'
                );
                // 组件未卸载时更新状态
                if (!isUnmounted.current) {
                    setWeChatQrcodeUrl(qrCodeUrl);
                }
            } catch (err) {
                console.error('【中奖弹窗】获取老板微信二维码失败：', err);
            }
        };
        void getWeChatQrcodeUrl();

        // 组件卸载时标记为已卸载
        return () => {
            isUnmounted.current = true;
        };
    }, []);

    /**
     * 初始化弹窗数据
     * 作用：请求抽奖结果，根据结果判断是否显示中奖弹窗
     */
    useEffect(() => {
        const initModalData = async () => {
            let lotteryResult: LotteryDrawRes | null = null;

            // 生成随机数
            const randomRate = Math.random();
            const currentDateHour = getCurrentDateHour(); // 获取当前的日期+小时 2026033123
            const lastTriggerDateHour = localStorage.getItem(LAST_TRIGGER_DATETIME_KEY);

            // 核心逻辑：触发接口的两个条件
            // - 条件1：随机数命中1%概率
            // - 条件2：本自然小时（日期+小时）内未触发过接口
            const canTriggerApi = randomRate <= WINNING_PROBABILITY && lastTriggerDateHour !== currentDateHour && new Date() >= WINNING_START_TIME;
            if (canTriggerApi) {
                // 调用抽奖接口获取结果
                lotteryResult = await fetchLotteryResult();
            } else {
                // 本地模拟未中奖结果（用于测试）
                lotteryResult = {
                    success: true,
                    is_win: false,
                    message: '未中奖',
                    today_count: 0,
                    hour_count: 0,
                    current_hour: currentDateHour,
                    win_code: ''
                };
            }
            localStorage.setItem(LAST_TRIGGER_DATETIME_KEY, currentDateHour);

            // 接口请求失败时的兜底处理
            if (!lotteryResult) {
                lotteryResult = {
                    success: true,
                    is_win: false,
                    message: '抽奖请求失败，请稍后重试',
                    today_count: 0,
                    hour_count: 0,
                    current_hour: '',
                    win_code: ''
                };
            }

            // 更新抽奖结果状态
            setLotteryResult(lotteryResult);
            // 仅当接口成功且中奖时显示弹窗
            setIsModalShow(lotteryResult.success && lotteryResult.is_win);
            // 结束加载状态
            setIsLoading(false);
        };

        void initModalData();
    }, []);

    /**
     * 关闭弹窗处理函数
     * 作用：更新弹窗显示状态，并执行外部传入的关闭回调
     */
    const handleCloseModal = () => {
        setIsModalShow(false);
        onClose?.();
    };

    // 加载中/未中奖/无结果时，不渲染弹窗
    if (isLoading || !isModalShow || !lotteryResult) return null;

    return (
        // 遮罩层：点击遮罩关闭弹窗
        <div className={styles.overlay} onClick={handleCloseModal}>
            {/* 弹窗容器：阻止事件冒泡，避免点击弹窗内部关闭 */}
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* 关闭按钮 */}
                <button
                    className={styles.modalCloseBtn}
                    onClick={handleCloseModal}
                    aria-label="关闭中奖弹窗" // 无障碍属性
                >
                    ×
                </button>

                {/* 中奖标题 */}
                <h2 className={styles.title}>🎉 恭喜您！已中奖 🎉</h2>
                <p className={styles.tipText}>感谢您的参与，幸运好礼等你领取～</p>

                {/* 中奖码展示区域 */}
                <div className={styles.winCodeSection}>
                    <p className={styles.winCodeLabel}>您的中奖码：</p>
                    {/* 中奖码值：增加非空兜底 */}
                    <div className={styles.winCodeValue}>{lotteryResult.win_code || '暂无中奖码'}</div>
                    <p className={styles.winCodeTip}>请凭此码联系老板核对领奖信息</p>
                </div>

                {/* 二维码展示区域 */}
                <div className={styles.qrcodeSection}>
                    <div className={styles.qrcodeWrapper}>
                        <div className={styles.qrcodeCard}>
                            <div className={styles.qrcodeImgBox}>
                                {/* 二维码图片：增加加载失败兜底 */}
                                <img
                                    src={weChatQrCodeUrl}
                                    alt="老板微信二维码（扫码联系领奖）"
                                    className={styles.qrcodeImg}
                                />
                            </div>
                            <p className={styles.qrcodeLabel}>
                                <i className="bi bi-chat-dots"></i>
                                <span>老板微信（扫码领奖）</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}