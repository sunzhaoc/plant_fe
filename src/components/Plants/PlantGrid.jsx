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

// 提取植物属名（核心逻辑保留，精简空值判断）
const getGenera = (plants = []) => {
    const genera = new Set();
    plants.forEach(plant => {
        const genus = plant?.plantLatinName?.split(' ')[0];
        if (genus) genera.add(genus);
    });
    return Array.from(genera);
};

// 下拉选项组件（移除未使用的isReset属性）
const DropdownItem = ({genus, onClick, active}) => (
    <button
        className={`${styles.dropdownItem} ${active ? styles.active : ''}`}
        onClick={() => onClick(genus)}
    >
        {genus}
    </button>
);

// 下拉分组组件（精简逻辑，保留核心功能）
const DropdownGroup = ({groupName, genera, selectedGenus, onGenusSelect, allGenera}) => {
    // 仅保留有数据的属名
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
    // 1. 修改初始值为 null（标识未初始化）
    const [selectedGenus, setSelectedGenus] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownTimeoutRef = useRef(null);

    // 提取所有属名（增加空值保护）
    const allGenera = useMemo(() => getGenera(plantList), [plantList]);

    // 2. 新增 useEffect：数据加载完成后自动选中第一个属名
    useEffect(() => {
        // 加载中/有错误/已选中/无属名时不执行
        if (loading || error || selectedGenus !== null || allGenera.length === 0) return;

        // 默认选中第一个属名（也可以指定固定属名，比如 const defaultGenus = 'Hoya'）
        const defaultGenus = allGenera[0];
        setSelectedGenus(defaultGenus);

        // 可选：自动定位到默认属名所在的顶级分类（优化用户体验）
        // 遍历分类体系，找到包含默认属名的顶级分类
        for (const [topCategory, groups] of Object.entries(topLevelCategories)) {
            for (const [_, genera] of Object.entries(groups)) {
                if (genera.includes(defaultGenus)) {
                    setActiveCategory(topCategory);
                    break;
                }
            }
        }
    }, [loading, error, allGenera, selectedGenus]);

    // 筛选植物（增加空值保护，精简逻辑）
    const filteredPlants = useMemo(() => {
        if (!plantList) return [];
        // 未初始化时返回空（避免短暂展示全部），初始化后按选中属名筛选
        return selectedGenus !== null
            ? plantList.filter(plant => plant?.plantLatinName?.startsWith(selectedGenus))
            : [];
    }, [selectedGenus, plantList]);

    // 选择属名（精简逻辑）
    const handleGenusSelect = (genus) => {
        setSelectedGenus(genus);
        setDropdownVisible(false);
    };

    // 鼠标进入分类（精简写法）
    const handleMouseEnterCategory = (category) => {
        clearTimeout(dropdownTimeoutRef.current);
        setActiveCategory(category);
        setDropdownVisible(true);
    };

    // 鼠标离开（保留核心延迟逻辑）
    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setDropdownVisible(false);
        }, 200);
    };

    // 加载/错误状态（保留核心展示）
    if (loading) return <div className={styles.loader}>Loading Botanical Wonders...</div>;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.gridWrapper}>
            <nav className={styles.topLevelNav} onMouseLeave={handleMouseLeave}>
                <div className={styles.navContainer}>
                    {/* 顶级分类导航（精简循环逻辑） */}
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

            {/* 下拉面板（保留核心交互） */}
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
                                allGenera={allGenera}
                            />
                        ))}
                    </div>
                    {/*<div className={styles.panelFooter}>*/}
                    {/*    <button*/}
                    {/*        onClick={() => setSelectedGenus('')}*/}
                    {/*        className={styles.clearBtn}*/}
                    {/*    >*/}
                    {/*        Reset Filter 清除筛选*/}
                    {/*    </button>*/}
                    {/*</div>*/}
                </div>
            </nav>

            {/* 当前筛选状态（保留核心展示） */}
            <div className={styles.currentFilter}>
                {selectedGenus ? (
                    <p>Showing: <strong>{selectedGenus}</strong> <span>({filteredPlants.length} items)</span></p>
                ) : (
                    <p>Loading filter...</p>
                )}
            </div>

            {/* 植物卡片网格（保留核心渲染） */}
            <div className="row">
                {filteredPlants.map(plant => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}