import {useState, useCallback, useRef, useEffect} from 'react'; // 引入 useRef, useEffect
import api from '/src/utils/api.jsx';
import {PlantContext} from '/src/context/PlantContext.jsx';
import {sleep} from '/src/utils/time.jsx';

export const PlantProvider = ({children}) => {
    const [plantCache, setPlantCache] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const plantCacheRef = useRef(plantCache);
    useEffect(() => {
        plantCacheRef.current = plantCache;
    }, [plantCache]);

    const fetchPlantsByGenus = useCallback(async (genus) => {
        if (!genus) return;

        // 使用 Ref 检查缓存，而不是 state，这样此函数就不需要依赖 plantCache 了
        if (plantCacheRef.current[genus]) {
            console.log(`Cache hit for: ${genus}`);
            return;
        }

        setLoading(true);
        setError(null);
        await sleep(100);

        try {
            const response = await api.get('/api/plants', {
                params: {genus: genus}
            });

            if (!response.data.success) {
                throw new Error(response.data.message || "获取植物数据失败");
            }

            const transformedPlants = response.data.data.map(plant => ({
                plantId: plant.plant_id,
                plantName: plant.name,
                plantLatinName: plant.latin_name,
                plantMainImgUrl: plant.main_img_url ? plant.main_img_url : '',
                plantMinPrice: plant.min_price,
                plantStock: plant.stock,
                plantTag: plant.tag,
            }));

            setPlantCache(prevCache => ({
                ...prevCache,
                [genus]: transformedPlants
            }));
        } catch (err) {
            setError(err.message || '网络异常，无法获取商品列表');
            console.error("获取植物数据失败：", err);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <PlantContext.Provider
            value={{plantCache, loading, error, fetchPlantsByGenus}}
        >
            {children}
        </PlantContext.Provider>
    );
};