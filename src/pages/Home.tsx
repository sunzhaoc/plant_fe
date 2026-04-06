// src/pages/Home.tsx
import PlantGrid from 'src/components/Plants/PlantGrid';
import {Dispatch, SetStateAction} from "react";
import PrizeModal from 'src/components/Modal/PrizeModal';

interface HomeProps {
    selectedGenus: string | undefined;
    selectedIsNew: boolean;
    setSelectedGenus: (genus: string) => void;
    setSelectedIsNew: Dispatch<SetStateAction<boolean>>;
}

export default function Home({selectedGenus, selectedIsNew}: HomeProps) {
    return (
        <div>
            {/*抽奖*/}
            <PrizeModal />

            <div className="mb-5 text-center">
                <h1 className="mb-3">🌿探索非凡，分享不寻常的绿意🍃</h1>
                {/*<p className="text-muted">🌿探索非凡，分享不寻常的绿意🍃</p>*/}
            </div>

            <PlantGrid
                selectedGenus={selectedGenus}
                selectedIsNew={selectedIsNew}
            />
        </div>
    );
}