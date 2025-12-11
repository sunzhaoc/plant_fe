import { useParams, Navigate } from 'react-router-dom';
import PlantDetail from '../components/Plants/PlantDetail';
import { plantsData } from '../components/Plants/PlantGrid';

export default function Detail() {
    const { id } = useParams();
    const plant = plantsData.find(p => p.id === Number(id));

    if (!plant) {
        return <Navigate to="/" replace />;
    }

    return <PlantDetail plant={plant} />;
}