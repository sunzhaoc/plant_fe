import {createContext, useContext} from 'react';

export const PlantContext = createContext(undefined);

export const usePlants = () => {
    const context = useContext(PlantContext);
    if (!context) {
        throw new Error('usePlants must be used within a PlantProvider');
    }
    return context;
};