import {createContext, useContext} from 'react';

// 定义植物数据结构接口
export interface Plant {
    plantId: string | number;
    plantName: string;
    plantLatinName: string;
    plantMainImgUrl: string;
    plantMinPrice: number;
    plantStock: number;
    plantTag: string | string[];
}

// 定义植物缓存类型
export type PlantCache = {
    [genus: string]: Plant[];
};

// 定义Context值的类型
export interface PlantContextValue {
    plantCache: PlantCache;
    newPlantProductCache: Plant[];
    loading: boolean;
    error: string | null;
    fetchPlantsByGenus: (genus: string) => Promise<void>;
    fetchNewProducts: () => Promise<void>;
    fetchPlants: (params: { genus?: string; isNew?: boolean }) => Promise<void>;
}

// 创建Context并指定类型，默认值为undefined
export const PlantContext = createContext<PlantContextValue | undefined>(undefined);

// 自定义Hook
export const usePlants = () => {
    const context = useContext(PlantContext);
    if (!context) {
        throw new Error('usePlants must be used within a PlantProvider');
    }
    return context;
};