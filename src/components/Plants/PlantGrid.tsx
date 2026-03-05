import PlantCard from 'src/components/Plants/PlantCard';
import {useMemo, useEffect} from 'react';
import {usePlants} from 'src/context/PlantContext.tsx';
import styles from 'src/components/Plants/PlantGrid.module.css';
import LoadingSpinner from "src/utils/LoadingSpinner.tsx";

// 完善 Plant 接口，补充 PlantCard 所需的所有必选属性
interface Plant {
    plantId: string | number;
    plantName: string; // 植物名称
    plantLatinName: string; // 植物拉丁名
    plantMinPrice: number; // 最低价格
    plantStock: number; // 库存数量
    plantMainImgUrl: string; // 主图URL
    [key: string]: any; // 保留任意属性的灵活性
}

interface PlantGridProps {
    selectedGenus: string | undefined;
}

type PlantCache = Record<string, Plant[]>;

export default function PlantGrid({selectedGenus}: PlantGridProps) {
    const {plantCache, loading, error, fetchPlantsByGenus} = usePlants();

    // 根据选中的属获取植物数据
    useEffect(() => {
        if (!selectedGenus) return;

        const timer = setTimeout(() => {
            fetchPlantsByGenus(selectedGenus);
        }, 100);

        return () => clearTimeout(timer);
    }, [selectedGenus, fetchPlantsByGenus]);

    // 从缓存获取当前属的植物列表
    const filteredPlants = useMemo(() => {
        if (typeof selectedGenus !== 'string') {
            return [];
        }
        return (plantCache as PlantCache)[selectedGenus] || [];
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
                {filteredPlants?.map((plant: Plant) => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}