import PlantGrid from '/src/components/Plants/PlantGrid';

export default function Home() {
    return (
        <div>
            <div className="mb-5 text-center">
                <h1 className="mb-3">蚁栖植物精选</h1>
                <p className="text-muted">探索与蚂蚁共生的神奇植物世界</p>
            </div>
            <PlantGrid />
        </div>
    );
}