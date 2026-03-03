// PlantGrid.jsx
import PlantCard from '/src/components/Plants/PlantCard';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {usePlants} from '/src/context/PlantContext.jsx';
import styles from '/src/components/Plants/PlantGrid.module.css';
import LoadingSpinner from "/src/utils/LoadingSpinner.jsx";
import TopLevelNav from '/src/components/Plants/TopLevelNav';
import {getFirstGenus, findTopCategoryForGenus} from '/src/components/Plants/plantCategories'; // 从共享文件导入

export default function PlantGrid() {
    const {plantCache, loading, error, fetchPlantsByGenus} = usePlants();

    // 初始化选中属和激活分类
    const [selectedGenus, setSelectedGenus] = useState(() => {
        const defaultGenus = getFirstGenus();
        return defaultGenus || null;
    });

    const [activeCategory, setActiveCategory] = useState(() => {
        const defaultGenus = getFirstGenus();
        return defaultGenus ? findTopCategoryForGenus(defaultGenus) : null;
    });

    const [dropdownVisible, setDropdownVisible] = useState(false);

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

    // 异常状态处理
    if (loading) return <LoadingSpinner text="正在加载植物详情..." />;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.gridWrapper}>
            {/* 引入拆分后的导航栏组件 */}
            <TopLevelNav
                selectedGenus={selectedGenus}
                onGenusSelect={handleGenusSelect}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                dropdownVisible={dropdownVisible}
                setDropdownVisible={setDropdownVisible}
            />

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