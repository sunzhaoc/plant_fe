/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {Number} delay 延迟时间（ms）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, delay = 500) => {
    let timer = null;
    return (...args) => {
        // 清除上一次的定时器
        if (timer) clearTimeout(timer);
        // 重新设置定时器，延迟执行
        timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
        }, delay);
    };
};