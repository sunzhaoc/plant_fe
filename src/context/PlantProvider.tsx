import {useState, useCallback, useRef, useEffect, ReactNode} from 'react';
import api from 'src/utils/api.tsx';
import {PlantContext, PlantCache, Plant} from 'src/context/PlantContext.tsx';
import {sleep} from 'src/utils/time.tsx';

interface PlantProviderProps {
    children: ReactNode;
}

// 植物请求参数类型
interface FetchPlantsParams {
    genus?: string;
    isNew?: boolean;
}

export const PlantProvider = ({children}: PlantProviderProps) => {
    const [plantCache, setPlantCache] = useState<PlantCache>({});
    const [newPlantProductCache, setNewPlantProductCache] = useState<Plant[]>([]);  // 新品缓存
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const plantCacheRef = useRef<PlantCache>(plantCache);
    const newProductCacheRef = useRef<Plant[]>([]);

    useEffect(() => {
        plantCacheRef.current = plantCache;
        newProductCacheRef.current = newPlantProductCache;
    }, [plantCache, newPlantProductCache]);

    /**
     * 植物查询（属名+新品查询合并）
     */
    const fetchPlants = useCallback(async ({genus, isNew}: FetchPlantsParams) => {
        // 互斥条件：要么查属名，要么查新品
        if (!genus && !isNew) return;

        // 缓存命中判断
        if (genus && plantCacheRef.current[genus]) {
            console.log(`Cache hit for genus: ${genus}`);
            return;
        }
        if (isNew && newProductCacheRef.current.length > 0) {
            console.log(`Cache hit for new products`);
            return;
        }

        setLoading(true);
        setError(null);
        await sleep(100);

        try {
            const params: Record<string, any> = {};
            if (genus) params.genus = genus;
            if (isNew) params.is_new = true;

            const response = await api.get('/api/plants', {params});

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

            // 根据查询类型更新缓存
            if (genus) {
                setPlantCache(prevCache => ({
                    ...prevCache,
                    [genus]: transformedPlants
                }));
            } else if (isNew) {
                setNewPlantProductCache(transformedPlants);
            }
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

    /**
     * 植物属名查询功能
     */
    const fetchPlantsByGenus = useCallback(async (genus: string) => {
        await fetchPlants({genus});
    }, [fetchPlants]);


    /**
     * 植物新品查询功能
     */
    const fetchNewProducts = useCallback(async () => {
        await fetchPlants({isNew: true});
    }, [fetchPlants]);

    return (
        <PlantContext.Provider
            value={{
                plantCache,
                newPlantProductCache: newPlantProductCache,
                loading,
                error,
                fetchPlantsByGenus, // 属名查询方法
                fetchNewProducts, // 新品查询方法
                fetchPlants // 通用查询方法（属名+新品）
            }}
        >
            {children}
        </PlantContext.Provider>
    );
};