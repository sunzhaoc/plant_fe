import PlantCard from '/src/components/Plants/PlantCard';
import {useState, useMemo, useRef, useEffect} from 'react';
import {usePlants} from '/src/context/PlantContext.jsx';
import styles from '/src/components/Plants/PlantGrid.module.css';

// 植物分类体系
const topLevelCategories = {
    'Ant-Rubiaceae & Caudiciforms': {
        'Myrmecophytic Rubiaceae 蚁栖茜草群': ['Squamellaria', 'Anthorrhiza', 'Hydnophytum', 'Myrmecodia', 'Myrmephytum'],
    },
    'Episodic Gesneriads & Ericads': {
        'Epiphytic Gesneriads 附生苦苣苔群': ['Columnea', 'Aeschynanthus', 'Agalmyla', 'Drymonia', 'Glossoloma', 'Trichodrymonia'],
        'Epiphytic Ericaceae 附生杜鹃群': ['Ceratostema', 'Disterigma', 'Macleania'],
    },
    'Epiphytic Ferns': {
        'Polypodiaceae & Myrmecophytic Ferns 水龙骨与蚁蕨群': ['Lecanopteris', 'Solanopteris', 'Microgramma', 'Serpocaulon', 'Lepisorus', 'Drynaria', 'Doodia'],
    },
    'Apocynaceae & Climbers': {
        "Asclepiads 萝藦亚科群": ["Hoya", "Dischidia"]
    },
    "Miscellaneous": {
        "Rainforest Understory 雨林底层与附生综合群": ["Medinilla", "Pachycentria", "Poikilogyne", "Tococa", "Peperomia", "Begonia"],
        "Terrestrial & Shrubby 地生与灌木群": ["Arthropodium", "Tacca", "Tigridiopalma", "Lycianthes", "Cecropia", "Macaranga"]
    }
};

// 提取植物属名
const getGenera = (plants = []) => {
    const genera = new Set();
    plants.forEach(plant => {
        const genus = plant?.plantLatinName?.split(' ')[0];
        if (genus) genera.add(genus);
    });
    return Array.from(genera);
};

// 下拉选项组件
const DropdownItem = ({genus, onClick, active}) => (
    <button
        className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
        onClick={() => onClick(genus)}
    >
        {genus}
    </button>
);

// 下拉分组组件
const DropdownGroup = ({groupName, genera, selectedGenus, onGenusSelect, allGenera}) => {
    const availableGenera = useMemo(() =>
            genera.filter(genus => allGenera.includes(genus)),
        [genera, allGenera]);

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
};

export default function PlantGrid() {
    const {plantList, loading, error} = usePlants();
    const [selectedGenus, setSelectedGenus] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownTimeoutRef = useRef(null);
    const navRef = useRef(null);

    const allGenera = useMemo(() => getGenera(plantList), [plantList]);

    // 初始化逻辑
    useEffect(() => {
        if (loading || error || selectedGenus !== null || allGenera.length === 0) return;
        const defaultGenus = allGenera[0];
        setSelectedGenus(defaultGenus);

        for (const [topCategory, groups] of Object.entries(topLevelCategories)) {
            for (const [_, genera] of Object.entries(groups)) {
                if (genera.includes(defaultGenus)) {
                    setActiveCategory(topCategory);
                    break;
                }
            }
        }
    }, [loading, error, allGenera, selectedGenus]);

    // 筛选逻辑
    const filteredPlants = useMemo(() => {
        if (!plantList) return [];
        return selectedGenus !== null
            ? plantList.filter(plant => plant?.plantLatinName?.startsWith(selectedGenus))
            : [];
    }, [selectedGenus, plantList]);

    // 选择属名
    const handleGenusSelect = (genus) => {
        setSelectedGenus(genus);
        setDropdownVisible(false);
    };

    // 修复：兼容触摸/鼠标事件
    const handleCategoryActivate = (category) => {
        clearTimeout(dropdownTimeoutRef.current);
        setActiveCategory(category);
        setDropdownVisible(true);
    };

    // 修复：统一的隐藏逻辑（兼容移动端）
    const handleHideDropdown = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
            // 可选：清空激活的分类，避免残留状态
            setActiveCategory(null);
        }, 200);
    };

    // 加载/错误状态（不变）
    if (loading) return <div className={styles.loader}>Loading Botanical Wonders...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.gridWrapper}>
            {/* 修复1：添加ref + 同时绑定触摸/鼠标事件 */}
            <nav
                ref={navRef}
                className={styles.topLevelNav}
                onMouseLeave={handleHideDropdown}
                onTouchEnd={() => {}} // 触发移动端事件绑定
            >
                <div className={styles.navContainer}>
                    {Object.keys(topLevelCategories).map(category => (
                        <div
                            key={category}
                            className={styles.navItemWithDropdown}
                            // 修复2：同时绑定onMouseEnter + onClick（兼容移动端触摸）
                            onMouseEnter={() => handleCategoryActivate(category)}
                            onClick={() => handleCategoryActivate(category)}
                        >
                            <button
                                className={`${styles.navItem} ${activeCategory === category && dropdownVisible ? styles.navActive : ''}`}
                                // 修复3：阻止按钮默认行为（避免Safari点击穿透）
                                onClick={(e) => e.stopPropagation()}
                            >
                                {category}
                                <span className={styles.arrow}></span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* 下拉面板：核心修复点 */}
                <div
                    className={`${styles.unifiedDropdownPanel} ${dropdownVisible ? styles.panelVisible : ''}`}
                    // 修复4：同时绑定鼠标/触摸事件，防止提前隐藏
                    onMouseEnter={() => clearTimeout(dropdownTimeoutRef.current)}
                    onTouchStart={() => clearTimeout(dropdownTimeoutRef.current)}
                    onTouchEnd={(e) => e.stopPropagation()}
                >
                    <div className={styles.panelContent}>
                        {activeCategory && Object.entries(topLevelCategories[activeCategory]).map(([groupName, groupGenera]) => (
                            <DropdownGroup
                                key={groupName}
                                groupName={groupName}
                                genera={groupGenera}
                                selectedGenus={selectedGenus}
                                onGenusSelect={handleGenusSelect}
                                allGenera={allGenera}
                            />
                        ))}
                    </div>
                    <div className={styles.panelFooter}>
                        <button
                            onClick={() => setSelectedGenus('')}
                            className={styles.clearBtn}
                        >
                            Reset Filter 清除筛选
                        </button>
                    </div>
                </div>
            </nav>

            {/* 筛选状态 + 植物网格（不变） */}
            <div className={styles.currentFilter}>
                {selectedGenus ? (
                    <p>Showing: <strong>{selectedGenus}</strong> <span>({filteredPlants.length} items)</span></p>
                ) : (
                    <p>Loading filter...</p>
                )}
            </div>

            <div className="row">
                {filteredPlants.map(plant => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}