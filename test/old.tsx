import React, {useMemo, useCallback, useRef, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import styles from 'src/components/Plants/TopLevelNav.module.css';
import {topLevelCategories, allGenera, findTopCategoryForGenus} from 'src/components/Plants/plantCategories';

// ========== 核心类型定义 ==========
interface TopLevelCategoryMap {
    [category: string]: {
        [groupName: string]: string[];
    };
}

interface DropdownItemProps {
    genus: string;
    onClick: (genus: string) => void;
    active: boolean;
}

interface DropdownGroupProps {
    groupName: string;
    genera: string[];
    selectedGenus: string | null | undefined;
    onGenusSelect: (genus: string) => void;
}

interface TopLevelNavProps {
    selectedGenus: string | null | undefined;
    selectedIsNew: boolean;
    onGenusSelect: (genus: string) => void;
    onNewProductSelect: () => void;
}

// ========== 下拉选项组件 ==========
const DropdownItem = React.memo(({genus, onClick, active}: DropdownItemProps) => (
    <button
        className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
        onClick={() => onClick(genus)}
        type="button"
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
                         selectedIsNew,
                         onGenusSelect,
                         onNewProductSelect
                     }: TopLevelNavProps) => {
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const [activeCategory, setActiveCategory] = useState<string | null>(() => {
        if (selectedIsNew) return null;
        if (!selectedGenus) return null;
        const category = findTopCategoryForGenus(selectedGenus);
        return category ?? null;
    });
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleMouseEnterCategory = useCallback((category: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setActiveCategory(category);
        setDropdownVisible(true);
    }, [selectedIsNew]);

    const handleMouseLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    }, []);

    const handlePanelMouseEnter = useCallback(() => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
    }, []);

    const handleGenusSelect = useCallback((genus: string) => {
        if (selectedIsNew) {
            onNewProductSelect();
        }
        onGenusSelect(genus);
        const category = findTopCategoryForGenus(genus);
        if (category) {
            setActiveCategory(category);
        }
        setDropdownVisible(false);
        if (location.pathname !== '/') {
            navigate('/');
        }
    }, [onGenusSelect, navigate, location.pathname, selectedIsNew, onNewProductSelect]); // 依赖完整

    const handleNewProductClick = useCallback(() => {
        onNewProductSelect();
        setDropdownVisible(false);
        setActiveCategory(null);
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }
        if (location.pathname !== '/') {
            navigate('/');
        }
    }, [onNewProductSelect, navigate, location.pathname]);

    const typedTopLevelCategories = topLevelCategories as TopLevelCategoryMap;

    return (
        <>
            {/* 顶级分类导航栏 */}
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
                    {/* 原有分类导航项 */}
                    {Object.keys(typedTopLevelCategories).map((category: string) => (
                        <div
                            key={category}
                            className={styles.navItemWithDropdown}
                            onMouseEnter={() => handleMouseEnterCategory(category)}
                        >
                            <button
                                className={`${styles.navItem} ${
                                    activeCategory === category && dropdownVisible ? styles.navActive : ''
                                }`}
                                type="button"
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
                    className={`${styles.unifiedDropdownPanel} ${
                        dropdownVisible ? styles.panelVisible : ''
                    }`}
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