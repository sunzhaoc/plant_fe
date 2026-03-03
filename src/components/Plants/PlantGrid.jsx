// PlantGrid.jsx
import PlantCard from '/src/components/Plants/PlantCard';
import React, {useMemo, useEffect} from 'react';
import {usePlants} from '/src/context/PlantContext.jsx';
import styles from '/src/components/Plants/PlantGrid.module.css';
import LoadingSpinner from "/src/utils/LoadingSpinner.jsx";

export default function PlantGrid({selectedGenus}) {
    const {plantCache, loading, error, fetchPlantsByGenus} = usePlants();

    // 根据选中的属获取植物数据
    useEffect(() => {
        if (!selectedGenus) return;

        const timer = setTimeout(() => {
            fetchPlantsByGenus(selectedGenus);
        }, 100);

        return () => clearTimeout(timer); // 清除定时器，避免重复请求
    }, [selectedGenus, fetchPlantsByGenus]);

    // 从缓存获取当前属的植物列表
    const filteredPlants = useMemo(() => {
        return plantCache[selectedGenus] || [];
    }, [plantCache, selectedGenus]);

    // 异常状态处理
    if (loading) return <LoadingSpinner text="正在加载植物详情..." />;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.gridWrapper}>
            {/* 当前筛选状态展示 */}
            <div className={styles.currentFilter}>
                {selectedGenus && filteredPlants.length > 0 && (
                    <p>Showing: <strong>{selectedGenus}</strong> <span>({filteredPlants.length} items)</span></p>
                )}
                {!selectedGenus && <p>请选择植物分类</p>}
            </div>

            {/* 植物卡片网格 */}
            <div className="row">
                {filteredPlants?.map(plant => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}