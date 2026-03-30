import React, { useMemo, useCallback, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from 'src/components/Plants/TopLevelNav.module.css';
import { topLevelCategories, allGenera, findTopCategoryForGenus } from 'src/components/Plants/plantCategories';

// ========== 核心类型定义 ==========
/**
 * 顶级分类映射接口
 * 结构：{ 分类名称: { 分组名称: [属名列表] } }
 */
interface TopLevelCategoryMap {
    [category: string]: {
        [groupName: string]: string[];
    };
}

/**
 * 下拉选项组件属性接口
 * @property genus 属名
 * @property onClick 点击事件回调（参数为属名）
 * @property active 是否为当前选中状态
 */
interface DropdownItemProps {
    genus: string;
    onClick: (genus: string) => void;
    active: boolean;
}

/**
 * 下拉分组组件属性接口
 * @property groupName 分组名称
 * @property genera 该分组下的属名列表
 * @property selectedGenus 当前选中的属名（可能为空）
 * @property onGenusSelect 选择属名的回调函数
 */
interface DropdownGroupProps {
    groupName: string;
    genera: string[];
    selectedGenus: string | null | undefined;
    onGenusSelect: (genus: string) => void;
}

/**
 * 顶级导航组件属性接口
 * @property selectedGenus 当前选中的属名（可能为空）
 * @property selectedIsNew 是否选中"新品"分类
 * @property onGenusSelect 选择属名的回调函数
 * @property onNewProductSelect 选择"新品"的回调函数
 */
interface TopLevelNavProps {
    selectedGenus: string | null | undefined;
    selectedIsNew: boolean;
    onGenusSelect: (genus: string) => void;
    onNewProductSelect: () => void;
}

// ========== 下拉选项组件 ==========
/**
 * 下拉选项组件（记忆化组件，避免不必要的重渲染）
 * 单个属名的可点击选项，支持选中状态样式
 * @param props DropdownItemProps
 * @returns ReactElement 下拉选项按钮
 */
const DropdownItem = React.memo(({ genus, onClick, active }: DropdownItemProps) => (
    <button
        className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
        onClick={() => onClick(genus)}
        type="button" // 显式声明button类型，避免表单默认行为
    >
        {genus}
    </button>
));

// ========== 下拉分组组件 ==========
/**
 * 下拉分组组件（记忆化组件）
 * 按分组展示属名列表，过滤掉不在allGenera中的无效属名
 * @param props DropdownGroupProps
 * @returns ReactElement | null 分组容器（无有效属名时返回null）
 */
const DropdownGroup = React.memo(({ groupName, genera, selectedGenus, onGenusSelect }: DropdownGroupProps) => {
    // 记忆化处理：过滤出存在于全局allGenera中的有效属名，避免重复计算
    const availableGenera = useMemo(() =>
        genera.filter(genus => allGenera.includes(genus)),
        [genera] // 仅当genera变化时重新计算
    );

    // 无有效属名时不渲染该分组
    if (availableGenera.length === 0) return null;

    return (
        <div className={styles.dropdownGroupInPanel}>
            <h4 className={styles.groupTitle}>{groupName}</h4>
            <div className={styles.groupItems}>
                {availableGenera.map(genus => (
                    <DropdownItem
                        key={genus} // 唯一key保证React列表渲染性能
                        genus={genus}
                        onClick={onGenusSelect}
                        active={selectedGenus === genus} // 标记当前选中的属名
                    />
                ))}
            </div>
        </div>
    );
});

// ========== 顶级分类导航栏主组件 ==========
/**
 * 顶级分类导航栏核心组件
 * 功能：
 * 1. 展示"新品"和各类植物顶级分类
 * 2. 鼠标悬浮分类时显示下拉面板，展示该分类下的属名分组
 * 3. 支持选中状态高亮、路由跳转、下拉面板显隐延迟控制
 * @param props TopLevelNavProps
 * @returns ReactElement 顶级导航栏+下拉面板组合
 */
const TopLevelNav = ({
    selectedGenus, // 当前选中的属名
    selectedIsNew, // 是否选中"新品"
    onGenusSelect, // 选择属名的回调
    onNewProductSelect // 选择新品的回调
}: TopLevelNavProps) => {
    // 定时器Ref：用于控制下拉面板显隐的延迟（避免快速移开/移入时闪烁）
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // 路由导航钩子：用于跳转至首页
    const navigate = useNavigate();
    // 路由位置钩子：获取当前页面路径
    const location = useLocation();

    // 状态：当前激活的顶级分类（用于高亮和控制下拉面板内容）
    const [activeCategory, setActiveCategory] = useState<string | null>(() => {
        // 初始值逻辑：
        // 1. 选中新品时，激活分类为null
        // 2. 无选中属名时，激活分类为null
        // 3. 有选中属名时，匹配其对应的顶级分类
        if (selectedIsNew) return null;
        if (!selectedGenus) return null;
        const category = findTopCategoryForGenus(selectedGenus);
        return category ?? null;
    });

    // 状态：下拉面板是否可见
    const [dropdownVisible, setDropdownVisible] = useState(false);

    /**
     * 鼠标进入分类项的处理函数（记忆化）
     * 功能：清除现有延迟定时器，激活当前分类，显示下拉面板
     * @param category 鼠标进入的顶级分类名称
     */
    const handleMouseEnterCategory = useCallback((category: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current); // 清除之前的延迟隐藏定时器
        }
        setActiveCategory(category); // 激活当前分类
        setDropdownVisible(true); // 显示下拉面板
    }, [selectedIsNew]); // 依赖selectedIsNew：新品状态变化时重新创建函数

    /**
     * 鼠标离开导航栏/下拉面板的处理函数（记忆化）
     * 功能：设置延迟定时器，200ms后隐藏下拉面板（避免快速移开时闪烁）
     */
    const handleMouseLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    }, []);

    /**
     * 鼠标进入下拉面板的处理函数（记忆化）
     * 功能：清除延迟隐藏定时器，保证鼠标在面板内时面板不隐藏
     */
    const handlePanelMouseEnter = useCallback(() => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
    }, []);

    /**
     * 选择属名的处理函数（记忆化）
     * 功能：
     * 1. 若当前是新品状态，触发新品回调
     * 2. 触发属名选择回调
     * 3. 更新激活分类
     * 4. 隐藏下拉面板
     * 5. 非首页时跳转至首页
     * @param genus 选中的属名
     */
    const handleGenusSelect = useCallback((genus: string) => {
        if (selectedIsNew) {
            onNewProductSelect(); // 新品状态下先触发新品回调
        }
        onGenusSelect(genus); // 触发属名选择回调
        const category = findTopCategoryForGenus(genus);
        if (category) {
            setActiveCategory(category); // 更新激活的顶级分类
        }
        setDropdownVisible(false); // 隐藏下拉面板
        if (location.pathname !== '/') {
            navigate('/'); // 非首页时跳转至首页
        }
    }, [onGenusSelect, navigate, location.pathname, selectedIsNew, onNewProductSelect]); // 完整依赖：保证函数稳定性

    /**
     * 点击"新品"的处理函数（记忆化）
     * 功能：
     * 1. 触发新品选择回调
     * 2. 隐藏下拉面板，清空激活分类
     * 3. 清除延迟定时器
     * 4. 非首页时跳转至首页
     */
    const handleNewProductClick = useCallback(() => {
        onNewProductSelect(); // 触发新品回调
        setDropdownVisible(false); // 隐藏下拉面板
        setActiveCategory(null); // 清空激活分类（新品无对应分类）
        // 清除可能存在的延迟定时器
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }
        // 非首页时跳转至首页
        if (location.pathname !== '/') {
            navigate('/');
        }
    }, [onNewProductSelect, navigate, location.pathname]); // 依赖：保证函数稳定性

    // 类型断言：将topLevelCategories转为强类型的TopLevelCategoryMap，避免类型报错
    const typedTopLevelCategories = topLevelCategories as TopLevelCategoryMap;

    return (
        <>
            {/* 顶级分类导航栏容器 */}
            <nav className={styles.topLevelNav} onMouseLeave={handleMouseLeave}>
                <div className={styles.navContainer}>
                    {/* 新品导航项 */}
                    <div className={styles.navItemWithDropdown}>
                        <button
                            className={`${styles.navItem} ${selectedIsNew ? styles.navActive : ''}`}
                            onClick={handleNewProductClick}
                            type="button"
                        >
                            新品
                        </button>
                    </div>

                    {/* 遍历所有顶级分类，渲染分类导航项 */}
                    {Object.keys(typedTopLevelCategories).map((category: string) => (
                        <div
                            key={category} // 唯一key
                            className={styles.navItemWithDropdown}
                            onMouseEnter={() => handleMouseEnterCategory(category)} // 鼠标悬浮激活分类+显示面板
                        >
                            <button
                                className={`${styles.navItem} ${
                                    // 激活状态：当前分类激活且下拉面板可见时高亮
                                    activeCategory === category && dropdownVisible ? styles.navActive : ''
                                }`}
                                type="button"
                            >
                                {category}
                                <span className={styles.arrow}></span> {/* 下拉箭头装饰 */}
                            </button>
                        </div>
                    ))}
                </div>
            </nav>

            {/* 下拉面板容器 */}
            <nav className={styles.topLevelNav2} onMouseLeave={handleMouseLeave}>
                <div
                    className={`${styles.unifiedDropdownPanel} ${
                        dropdownVisible ? styles.panelVisible : '' // 面板可见性样式
                    }`}
                    onMouseEnter={handlePanelMouseEnter} // 鼠标进入面板时清除隐藏定时器
                >
                    <div className={styles.panelContent}>
                        {/* 渲染当前激活分类下的所有分组 */}
                        {activeCategory && Object.entries(typedTopLevelCategories[activeCategory]).map(([groupName, groupGenera]) => (
                            <DropdownGroup
                                key={groupName} // 唯一key
                                groupName={groupName}
                                genera={groupGenera}
                                selectedGenus={selectedGenus}
                                onGenusSelect={handleGenusSelect}
                            />
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
};

// 记忆化导出主组件：避免父组件重渲染时不必要的重渲染
export default React.memo(TopLevelNav);