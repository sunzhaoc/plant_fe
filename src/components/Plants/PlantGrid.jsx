import PlantCard from '/src/components/Plants/PlantCard';
import {useEffect, useState, useMemo} from 'react';
import api from "/src/utils/api.jsx";

// 提取所有独特的属名（从拉丁名中提取第一个单词）
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
    const [plantList, setPlantList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/plants');

                // 校验接口响应是否成功
                if (!response.data.success) {
                    throw new Error(response.data.message || "获取植物数据失败");
                }

                const transformedPlants = response.data.data.map(plant => ({
                    plantId: plant.plant_id,
                    plantName: plant.name,
                    plantLatinName: plant.latin_name,
                    plantMainImgUrl: plant.main_img_url ? plant.main_img_url : '',
                    plantMinPrice: plant.min_price,
                }));

                setPlantList(transformedPlants);
                setError(null);
            } catch (err) {
                setError(err.message || "网络异常，无法获取植物数据");
                setPlantList([]);
                console.error("获取植物数据失败：", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlants();
    }, []);


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
            <div className="mb-4 genus-filter">
                <div className="d-flex flex-wrap gap-2">
                    {genera.map(genus => (
                        <button
                            key={genus}
                            className={`btn genus-btn ${selectedGenus === genus ? 'active' : ''}`}
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