/**
 * 扩展 Navigator 接口以兼容实验性属性
 */
interface ExtendedNavigator extends Navigator {
    deviceMemory?: number; // 运行内存（GB）
}

/**
 * 精简后的原始设备信息接口
 * 专注于：唯一标识(UA)、硬件性能(CPU/RAM)、显示规格(Screen)、地理环境(TZ/Lang)
 */
export interface DeviceInfo {
    userAgent: string;             // 核心：浏览器及系统原始 UA
    platform: string;              // 平台：如 Win32, MacIntel, arm
    hardwareConcurrency: number;    // 核心数：逻辑 CPU 核心数
    deviceMemory?: number;         // 内存：设备近似内存容量
    screenWidth: number;           // 屏幕宽
    screenHeight: number;          // 屏幕高
    devicePixelRatio: number;      // 像素比：DPI/Retina 识别
    language: string;              // 语言
    timezone: string;              // 时区
}

/**
 * 获取最纯净、高价值的原始设备信息
 */
export const getDeviceInfo = (): DeviceInfo => {
    const nav = navigator as ExtendedNavigator;
    const { screen, devicePixelRatio } = window;

    return {
        // 基础标识
        userAgent: nav.userAgent,
        platform: nav.platform,

        // 硬件性能参数 (后端可据此判断高低端机型)
        hardwareConcurrency: nav.hardwareConcurrency || 0,
        deviceMemory: nav.deviceMemory,

        // 物理显示规格
        screenWidth: screen.width,
        screenHeight: screen.height,
        devicePixelRatio: devicePixelRatio || 1,

        // 区域环境
        language: nav.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
};