/**
 * 防抖函数
 * @param func 要执行的函数
 * @param delay 延迟时间（ms）
 * @returns 防抖后的函数
 */
export const debounce = (func: (...args: any[]) => void, delay: number = 500) => {
    let timer: NodeJS.Timeout | number | null = null;
    return (...args: any[]) => {
        // 清除上一次的定时器
        if (timer) clearTimeout(timer);
        // 重新设置定时器，延迟执行
        timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
        }, delay);
    };
};