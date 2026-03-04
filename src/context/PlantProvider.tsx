import {useState, useCallback, useRef, useEffect, ReactNode} from 'react';
import api from 'src/utils/api.tsx';
import {PlantContext, PlantCache, Plant} from 'src/context/PlantContext.tsx';
import {sleep} from 'src/utils/time.tsx';

interface PlantProviderProps {
    children: ReactNode;
}

export const PlantProvider = ({children}: PlantProviderProps) => {
    const [plantCache, setPlantCache] = useState<PlantCache>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const plantCacheRef = useRef<PlantCache>(plantCache);
    useEffect(() => {
        plantCacheRef.current = plantCache;
    }, [plantCache]);

    const fetchPlantsByGenus = useCallback(async (genus: string) => {
        if (!genus) return;

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

            const transformedPlants: Plant[] = response.data.data.map((plant: any) => ({
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
            let errorMessage = '网络异常，无法获取商品列表';
            if (err instanceof Error) {
                errorMessage = err.message || errorMessage;
            }
            setError(errorMessage);
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