// TopLevelNav.jsx
import React, {useMemo, useCallback, useRef} from 'react';
import styles from '/src/components/Plants/TopLevelNav.module.css';
import {topLevelCategories, allGenera} from '/src/components/Plants/plantCategories'; // 从共享文件导入

/** 下拉选项组件 */
const DropdownItem = React.memo(({genus, onClick, active}) => (
    <button
        className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
        onClick={() => onClick(genus)}
    >
        {genus}
    </button>
));

/** 下拉分组组件 */
const DropdownGroup = React.memo(({groupName, genera, selectedGenus, onGenusSelect}) => {
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

/** 顶级分类导航栏主组件 */
const TopLevelNav = ({
                         selectedGenus,
                         onGenusSelect,
                         activeCategory,
                         setActiveCategory,
                         dropdownVisible,
                         setDropdownVisible
                     }) => {
    const dropdownTimeoutRef = useRef(null);

    const handleMouseEnterCategory = useCallback((category) => {
        clearTimeout(dropdownTimeoutRef.current);
        setActiveCategory(category);
        setDropdownVisible(true);
    }, [setActiveCategory, setDropdownVisible]);

    const handleMouseLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    }, [setDropdownVisible]);

    const handlePanelMouseEnter = useCallback(() => {
        clearTimeout(dropdownTimeoutRef.current);
    }, []);

    return (
        <>
            {/* 顶级分类导航栏 */}
            <nav className={styles.topLevelNav} onMouseLeave={handleMouseLeave}>
                <div className={styles.navContainer}>
                    {Object.keys(topLevelCategories).map(category => (
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
                        {activeCategory && Object.entries(topLevelCategories[activeCategory]).map(([groupName, groupGenera]) => (
                            <DropdownGroup
                                key={groupName}
                                groupName={groupName}
                                genera={groupGenera}
                                selectedGenus={selectedGenus}
                                onGenusSelect={onGenusSelect}
                            />
                        ))}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default React.memo(TopLevelNav); // 仅导出组件