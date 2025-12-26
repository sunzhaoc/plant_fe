import {useState, useEffect} from 'react';
import api from '/src/utils/api.jsx';
import {PlantContext} from '/src/context/PlantContext.jsx'
import LoadingSpinner from "/src/utils/LoadingSpinner.jsx";
import {sleep} from '/src/utils/time.jsx';

export const PlantProvider = ({children}) => {
    const [plantList, setPlantList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (plantList.length === 0) {
            fetchPlantList();
        }
    }, []);

    // 获取商品列表数据
    const fetchPlantList = async () => {
        if (loading) return; // 防止重复请求
        setLoading(true);
        await sleep(100);
        try {
            const response = await api.get('/api/plants');
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
            setError(err.message || '网络异常，无法获取商品列表');
            setPlantList([]);
            console.error("获取植物数据失败：", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="正在加载植物..." />;
    }


    return (
        <PlantContext.Provider
            value={{plantList, loading, error, fetchPlantList}}
        >
            {children}
        </PlantContext.Provider>
    );
};

