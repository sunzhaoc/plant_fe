import PlantCard from '/src/components/Plants/PlantCard';
import {useState, useMemo} from 'react';
import {usePlants} from '/src/context/PlantContext.jsx';
import styles from '/src/components/Plants/PlantGrid.module.css'

// 提取所有独特的属名（保留你原有逻辑：从拉丁名中提取第一个单词）
const getGenera = (plants) => {
    const genera = new Set();
    plants.forEach(plant => {
        if (!plant.plantLatinName) return;
        const genus = plant.plantLatinName.split(' ')[0];
        genera.add(genus);
    });
    return ['全部', ...Array.from(genera)];
};

export default function PlantGrid() {
    // 从Context获取缓存的植物数据
    const {plantList, loading, error} = usePlants();

    const [selectedGenus, setSelectedGenus] = useState('全部');
    const genera = useMemo(() => {
        return getGenera(plantList);
    }, [plantList]);

    // 根据选中的属名筛选植物
    const filteredPlants = selectedGenus === '全部'
        ? plantList
        : plantList.filter(plant => {
            if (!plant.plantLatinName) return false;
            return plant.plantLatinName.split(' ')[0] === selectedGenus;
        });

    // 加载状态提示
    if (loading) {
        return <div className="text-center py-8">正在加载植物数据...</div>;
    }

    // 错误状态提示
    if (error) {
        return <div className="text-center py-8 text-danger">{error}</div>;
    }

    return (
        <div>
            {/* 属名筛选栏 */}
            <div className={`${styles.genusFilter} mb-4`}>
                <div className="d-flex flex-wrap gap-2">
                    {genera.map(genus => (
                        <button
                            key={genus}
                            className={`btn ${styles.genusBtn} ${selectedGenus === genus ? 'active' : ''}`}
                            onClick={() => setSelectedGenus(genus)}
                        >
                            {genus}
                        </button>
                    ))}
                </div>
            </div>

            {/* 植物网格 */}
            <div className="row">
                {filteredPlants.map(plant => (
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}