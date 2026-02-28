import PlantCard from '/src/components/Plants/PlantCard';
import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {usePlants} from '/src/context/PlantContext.jsx';
import styles from '/src/components/Plants/PlantGrid.module.css';
import LoadingSpinner from "/src/utils/LoadingSpinner.jsx";

/** 植物分类体系常量 */
const topLevelCategories = {
    'Ant-Rubiaceae & Caudiciforms': {
        'Myrmecophytic Rubiaceae 蚁栖茜草群': ['Squamellaria', 'Anthorrhiza', 'Hydnophytum', 'Myrmecodia', 'Myrmephytum'],
    },
    'Episodic Gesneriads & Ericads': {
        'Epiphytic Gesneriads 附生苦苣苔群': ['Columnea', 'Aeschynanthus', 'Agalmyla', 'Drymonia', 'Glossoloma', 'Trichodrymonia', 'Codonanthopsis', 'Nautilocalyx', 'Pachycaulos', 'Pearcea'],
        'Epiphytic Ericaceae 附生杜鹃群': ['Ceratostema', 'Disterigma', 'Macleania', 'Agapetes', 'Plutarchia', 'Semiramisia', 'Themistoclesia'],
    },
    'Epiphytic Ferns': {
        'Polypodiaceae & Myrmecophytic Ferns 水龙骨与蚁蕨群': ['Lecanopteris', 'Solanopteris', 'Microgramma', 'Pneumatopteris', 'Serpocaulon', 'Lepisorus', 'Drynaria', 'Doodia'],
    },
    'Apocynaceae & Climbers': {
        "Asclepiads 萝藦亚科群": ["Hoya", "Dischidia", "Phyllanthera"]
    },
    "Miscellaneous": {
        "Rainforest Understory 雨林底层与附生综合群": ["Medinilla", "Pachycentria", "Poikilogyne", "Tococa", "Peperomia", "Begonia"],
        "Terrestrial & Shrubby 地生与灌木群": ["Arthropodium", "Tacca", "Tigridiopalma", "Lycianthes", "Cecropia", "Macaranga"]
    }
};

/**
 * 工具函数：获取分类体系中第一个有效属名
 * @returns {string|undefined} 第一个属名，无数据时返回undefined
 */
const getFirstGenus = () => {
    for (const group of Object.values(topLevelCategories)) {
        for (const generaArray of Object.values(group)) {
            if (generaArray?.length > 0) return generaArray[0];
        }
    }
    return undefined;
};

/**
 * 工具函数：根据属名查找其所属的顶级分类
 * @param {string} targetGenus - 目标属名
 * @returns {string|undefined} 匹配的顶级分类名，未找到返回undefined
 */
const findTopCategoryForGenus = (targetGenus) => {
    for (const [topCategory, groups] of Object.entries(topLevelCategories)) {
        for (const [, genusList] of Object.entries(groups)) {
            if (genusList.includes(targetGenus)) {
                return topCategory; // 找到后立即返回，终止循环
            }
        }
    }
    return undefined;
};

/** 预先计算所有属名 */
const allGenera = (() => {
    const generaSet = new Set();
    Object.values(topLevelCategories).forEach(group => {
        Object.values(group || {}).forEach(generaList => {
            generaList?.forEach(genus => {
                if (genus) generaSet.add(genus);
            });
        });
    });
    return Array.from(generaSet);
})();

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

// ------------------------------ 3. 主组件优化 ------------------------------
export default function PlantGrid() {
    const {plantCache, loading, error, fetchPlantsByGenus} = usePlants();
    const [selectedGenus, setSelectedGenus] = useState(() => {
        const defaultGenus = getFirstGenus();
        return defaultGenus || null;
    });

    const [activeCategory, setActiveCategory] = useState(() => {
        const defaultGenus = getFirstGenus();
        return defaultGenus ? findTopCategoryForGenus(defaultGenus) : null;
    });

    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownTimeoutRef = useRef(null);

    // 根据选中的属获取植物数据
    useEffect(() => {
        if (selectedGenus) {
            fetchPlantsByGenus(selectedGenus);
        }
    }, [selectedGenus, fetchPlantsByGenus]);

    // 从缓存获取当前属的植物列表
    const filteredPlants = useMemo(() => {
        return plantCache[selectedGenus] || [];
    }, [plantCache, selectedGenus]);

    // 事件处理函数（选中了某个属名）
    const handleGenusSelect = useCallback((genus) => {
        setSelectedGenus(genus);
        setDropdownVisible(false);
    }, []);

    const handleMouseEnterCategory = useCallback((category) => {
        clearTimeout(dropdownTimeoutRef.current);
        setActiveCategory(category);
        setDropdownVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    }, []);

    // 异常状态处理
    if (loading) return <LoadingSpinner text="正在加载植物详情..." />;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.gridWrapper}>
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
                    onMouseEnter={() => clearTimeout(dropdownTimeoutRef.current)}
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

            {/* 当前筛选状态展示 */}
            <div className={styles.currentFilter}>
                {selectedGenus ? (
                    <p>Showing: <strong>{selectedGenus}</strong> <span>({filteredPlants.length} items)</span></p>
                ) : (
                    <p>Loading filter...</p>
                )}
            </div>

            {/* 植物卡片网格 */}
            <div className="row">
                {filteredPlants.map(plant => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}