// TopLevelNav.jsx
import React, {useMemo, useCallback, useRef, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import styles from 'src/components/Plants/TopLevelNav.module.css';
import {topLevelCategories, allGenera, findTopCategoryForGenus} from 'src/components/Plants/plantCategories'; // 引入 findTopCategoryForGenus

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
                         onGenusSelect
                     }) => {
    // 状态内部化：自己管理下拉显示和激活分类
    const [activeCategory, setActiveCategory] = useState(() => {
        return selectedGenus ? findTopCategoryForGenus(selectedGenus) : null;
    });
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const dropdownTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // 鼠标移入顶级分类：只更新内部状态
    const handleMouseEnterCategory = useCallback((category) => {
        clearTimeout(dropdownTimeoutRef.current);
        setActiveCategory(category);
        setDropdownVisible(true);
    }, []);

    // 鼠标离开：延迟隐藏下拉
    const handleMouseLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    }, []);

    // 鼠标进入下拉面板：取消隐藏
    const handlePanelMouseEnter = useCallback(() => {
        clearTimeout(dropdownTimeoutRef.current);
    }, []);

    // 点击子分类：更新全局状态 + 跳转首页
    const handleGenusSelect = useCallback((genus) => {
        onGenusSelect(genus); // 更新全局的 selectedGenus
        setDropdownVisible(false);

        // 如果当前在 Detail 页面，跳转到首页
        if (location.pathname !== '/') {
            navigate('/');
        }
    }, [onGenusSelect, navigate, location.pathname]);

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