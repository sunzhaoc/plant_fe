import PlantCard from 'src/components/Plants/PlantCard';
import {useMemo, useEffect} from 'react';
import {usePlants} from 'src/context/PlantContext.tsx';
import styles from 'src/components/Plants/PlantGrid.module.css';
import LoadingSpinner from "src/utils/LoadingSpinner.tsx";

interface PlantGridProps {
    selectedGenus: string | undefined;
    selectedIsNew: boolean;
}

type PlantCache = Record<string, any[]>;

export default function PlantGrid({selectedGenus, selectedIsNew}: PlantGridProps) {
    const {plantCache, newPlantProductCache, loading, error, fetchPlantsByGenus, fetchNewProducts} = usePlants();

    // 监听新品状态，触发接口请求
    useEffect(() => {
        if (selectedIsNew) {
            fetchNewProducts();
        }
    }, [selectedIsNew, fetchNewProducts]);

    // 监听属类状态，触发接口请求
    useEffect(() => {
        if (!selectedGenus || selectedIsNew) return;
        const timer = setTimeout(() => {
            fetchPlantsByGenus(selectedGenus);
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedGenus, fetchPlantsByGenus, selectedIsNew]);

    // 从缓存获取当前属的植物列表
    const filteredPlants = useMemo(() => {
        if (selectedIsNew) {
            return newPlantProductCache || [];
        }
        if (typeof selectedGenus !== 'string') {
            return [];
        }
        return (plantCache as PlantCache)[selectedGenus] || [];
    }, [plantCache, selectedGenus, selectedIsNew, newPlantProductCache]);

    // 异常状态
    if (loading) return <LoadingSpinner text="正在加载植物详情..." />;
    if (error) return <div className={styles.errorMessage}>Error: {error}</div>;

    return (
        <div className={styles.gridWrapper}>
            {/* 当前筛选状态展示 */}
            <div className={styles.currentFilter}>
                {selectedIsNew ? (
                    <p>Showing: <strong>新品植物</strong> <span>({filteredPlants.length} items)</span></p>
                ) : selectedGenus && filteredPlants.length > 0 ? (
                    <p>Showing: <strong>{selectedGenus}</strong> <span>({filteredPlants.length} items)</span></p>
                ) : (
                    <p>请选择植物分类</p>
                )}
            </div>

            {/* 植物卡片网格 */}
            <div className="row">
                {filteredPlants?.map((plant) => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}