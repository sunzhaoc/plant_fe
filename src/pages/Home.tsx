import PlantGrid from 'src/components/Plants/PlantGrid';

interface HomeProps {
    selectedGenus?: string;
    setSelectedGenus: (selectedGenus: string) => void;
}

export default function Home({selectedGenus}: HomeProps) {
    return (
        <div>
            <div className="mb-5 text-center">
                <h1 className="mb-3">✨26年04月订购正式开启（04月05日截单）🎉
                </h1>
                <p className="text-muted">🌿探索非凡，分享不寻常的绿意🍃</p>
            </div>

            <PlantGrid
                selectedGenus={selectedGenus}
            />
        </div>
    );
}