/**
 * 延迟函数（基于Promise）
 * @param {number} ms - 延迟的毫秒数
 * @returns {Promise<void>} Promise对象，延迟指定毫秒后resolve
 */
export function sleep(ms) {
    // 增加参数校验，避免传入非数字或负数导致异常
    const delay = Math.max(0, Number(ms) || 0);
    return new Promise(resolve => setTimeout(resolve, delay));
}