import {useState, useEffect} from 'react';
import styles from '/src/components/Cart/Address.module.css';
import toast from 'react-hot-toast';
import {useAuth} from '/src/context/AuthContext';

/**
 * 默认地址对象初始值
 */
const DEFAULT_ADDRESS = {
    receiver: '',       // 收货人姓名
    phone: '',          // 联系电话
    province: '',       // 省
    city: '',           // 市
    area: '',           // 区/县
    detailAddress: '',  // 详细地址
};

/**
 * 地址管理组件
 * @param {Function} onAddressChange - 当地址保存成功时触发的回调，通知父组件地址已更新
 */
export default function Address({onAddressChange}) {
    const {user} = useAuth();

    const getInitialAddress = () => {
        const saved = localStorage.getItem(`userShippingAddress_${user.id}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("地址解析失败", e);
                return DEFAULT_ADDRESS;
            }
        }
        return DEFAULT_ADDRESS;
    };

    // address: 已经确认并保存的地址（展示态使用）
    const [address, setAddress] = useState(getInitialAddress);
    // tempAddress: 在输入框中修改但尚未保存的中间值（编辑态使用）
    const [tempAddress, setTempAddress] = useState(address);
    // 控制组件是“展示态”还是“编辑态”
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (address) {
            onAddressChange?.(address);
        }
    }, [address, onAddressChange]);

    /**
     * 统一处理所有 Input 框的变更
     * 使用 computed property name 语法动态更新 tempAddress
     */
    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setTempAddress(prev => ({...prev, [name]: value}));
    };

    /**
     * 保存逻辑
     */
    const handleSave = () => {
        const {receiver, phone, province, city, area, detailAddress} = tempAddress;

        // 1. 非空校验
        if (!receiver || !phone || !detailAddress || !province) {
            toast.error('请完善收货信息');
            return;
        }
        // 2. 手机号正则校验
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            toast.error('手机号格式不正确');
            return;
        }

        // 3. 更新持久化状态
        setAddress(tempAddress);
        localStorage.setItem(`userShippingAddress_${user.id}`, JSON.stringify(tempAddress));

        // 4. 退出编辑态并通知父组件
        setIsEditing(false);
        onAddressChange?.(tempAddress);
        toast.success('收货地址已更新');
    };

    /**
     * 取消编辑逻辑
     */
    const handleCancel = () => {
        // 如果原本就没有地址（第一次进入），不允许取消，强制必须填写
        if (!address.receiver) {
            toast.error('请先保存地址信息');
            return;
        }
        // 还原 tempAddress 为上次保存的内容，并关闭编辑框
        setTempAddress(address);
        setIsEditing(false);
    };

    return (
        <div className={styles.addressContainer}>
            {/* 头部区域：标题与修改按钮 */}
            <div className={styles.header}>
                <h3 className={styles.title}>收货人信息</h3>
                {!isEditing && (
                    <button
                        className="btn btn-link btn-sm text-decoration-none"
                        onClick={() => setIsEditing(true)}
                    >
                        修改地址
                    </button>
                )}
            </div>

            {/* 条件渲染：编辑表单 vs 信息展示 */}
            {isEditing ? (
                /* --- 编辑模式 --- */
                <div className={styles.editForm}>
                    <div className={styles.inputGroup}>
                        <div className={styles.formItem}>
                            <input
                                name="receiver"
                                className={styles.inputField}
                                placeholder="收货人姓名"
                                value={tempAddress.receiver}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formItem}>
                            <input
                                name="phone"
                                className={styles.inputField}
                                placeholder="联系电话"
                                maxLength={11}
                                value={tempAddress.phone}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* 地区选择（简单实现，后续可优化为选择器组件） */}
                    <div className={styles.inputGroup}>
                        <input
                            name="province"
                            className={styles.inputField}
                            style={{flex: 1}}
                            placeholder="省份（如：广东省）"
                            value={tempAddress.province}
                            onChange={handleInputChange}
                        />
                        <input
                            name="city"
                            className={styles.inputField}
                            style={{flex: 1}}
                            placeholder="城市"
                            value={tempAddress.city}
                            onChange={handleInputChange}
                        />
                        <input
                            name="area"
                            className={styles.inputField}
                            style={{flex: 1}}
                            placeholder="区/县"
                            value={tempAddress.area}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formItem}>
                        <input
                            name="detailAddress"
                            className={styles.inputField}
                            placeholder="详细地址（街道、门牌号、小区等）"
                            value={tempAddress.detailAddress}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.btnGhost} onClick={handleCancel}>取消</button>
                        <button className={styles.btnPrimary} onClick={handleSave}>确认使用</button>
                    </div>
                </div>
            ) : (
                /* --- 展示模式 --- */
                <div className={styles.displayWrapper} onClick={() => setIsEditing(true)}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>收件人：</span>
                        <span className={styles.content}>{address.receiver}</span>
                        <span className={`${styles.content} ms-3`}>{address.phone}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>收货地址：</span>
                        <span className={styles.content}>
                            {address.province} {address.city} {address.area} {address.detailAddress}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}