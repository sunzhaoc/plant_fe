import React, {useMemo, useCallback, useRef, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import styles from 'src/components/Plants/TopLevelNav.module.css';
import {topLevelCategories, allGenera, findTopCategoryForGenus} from 'src/components/Plants/plantCategories';

// ========== 核心类型定义 ==========
/** 顶级分类结构类型（解决索引签名问题） */
interface TopLevelCategoryMap {
    [category: string]: {
        [groupName: string]: string[];
    };
}

/** DropdownItem 组件Props类型 */
interface DropdownItemProps {
    genus: string;
    onClick: (genus: string) => void;
    active: boolean;
}

/** DropdownGroup 组件Props类型 */
interface DropdownGroupProps {
    groupName: string;
    genera: string[];
    selectedGenus: string | null | undefined;
    onGenusSelect: (genus: string) => void;
}

/** TopLevelNav 主组件Props类型 */
interface TopLevelNavProps {
    selectedGenus: string | null | undefined;
    onGenusSelect: (genus: string) => void;
}

// ========== 下拉选项组件 ==========
const DropdownItem = React.memo(({genus, onClick, active}: DropdownItemProps) => (
    <button
        className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
        onClick={() => onClick(genus)}
    >
        {genus}
    </button>
));

// ========== 下拉分组组件 ==========
const DropdownGroup = React.memo(({groupName, genera, selectedGenus, onGenusSelect}: DropdownGroupProps) => {
    const availableGenera = useMemo(() =>
            genera.filter(genus => allGenera.includes(genus)),
        [genera]
    );

    if (availableGenera.length === 0) return null;

    return (
        <div className={styles.dropdownGroupInPanel}>
            <h4 className={styles.groupTitle}>{groupName}</h4>
            <div className={styles.groupItems}>
                {availableGenera.map(genus => (
                    <DropdownItem
                        key={genus}
                        genus={genus}
                        onClick={onGenusSelect}
                        active={selectedGenus === genus}
                    />
                ))}
            </div>
        </div>
    );
});

// ========== 顶级分类导航栏主组件 ==========
const TopLevelNav = ({
                         selectedGenus,
                         onGenusSelect
                     }: TopLevelNavProps) => {
    // 修复1：明确 Ref 类型为 NodeJS.Timeout | null（解决 clearTimeout 参数类型问题）
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 修复2：useState 初始值函数确保返回 string | null（消除 undefined）
    const [activeCategory, setActiveCategory] = useState<string | null>(() => {
        if (!selectedGenus) return null;
        // 强制处理 findTopCategoryForGenus 可能返回 undefined 的情况，兜底为 null
        const category = findTopCategoryForGenus(selectedGenus);
        return category ?? null;
    });
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // 修复3：clearTimeout 前先判断 ref.current 不为 null（解决参数类型不匹配）
    const handleMouseEnterCategory = useCallback((category: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setActiveCategory(category);
        setDropdownVisible(true);
    }, []);

    // 修复4：同上，clearTimeout 前做非空判断
    const handleMouseLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    }, []);

    // 修复5：同上，clearTimeout 前做非空判断
    const handlePanelMouseEnter = useCallback(() => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
    }, []);

    // 修复6：明确 genus 参数类型为 string
    const handleGenusSelect = useCallback((genus: string) => {
        onGenusSelect(genus);
        setDropdownVisible(false);

        if (location.pathname !== '/') {
            navigate('/');
        }
    }, [onGenusSelect, navigate, location.pathname]);

    // 修复7：类型断言确保 topLevelCategories 符合索引签名
    const typedTopLevelCategories = topLevelCategories as TopLevelCategoryMap;

    return (
        <>
            {/* 顶级分类导航栏 */}
            <nav className={styles.topLevelNav} onMouseLeave={handleMouseLeave}>
                <div className={styles.navContainer}>
                    {Object.keys(typedTopLevelCategories).map((category: string) => (
                        <div
                            key={category}
                            className={styles.navItemWithDropdown}
                            onMouseEnter={() => handleMouseEnterCategory(category)}
                        >
                            <button
                                className={`${styles.navItem} ${activeCategory === category && dropdownVisible ? styles.navActive : ''}`}
                            >
                                {category}
                                <span className={styles.arrow}></span>
                            </button>
                        </div>
                    ))}
                </div>
            </nav>

            {/* 下拉面板 */}
            <nav className={styles.topLevelNav2} onMouseLeave={handleMouseLeave}>
                <div
                    className={`${styles.unifiedDropdownPanel} ${dropdownVisible ? styles.panelVisible : ''}`}
                    onMouseEnter={handlePanelMouseEnter}
                >
                    <div className={styles.panelContent}>
                        {activeCategory && Object.entries(typedTopLevelCategories[activeCategory]).map(([groupName, groupGenera]) => (
                            <DropdownGroup
                                key={groupName}
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

export default React.memo(TopLevelNav);