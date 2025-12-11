import PlantCard from './PlantCard';

// 模拟植物数据
export const plantsData = [
    {
        id: 1,
        name: '大王蚁堡',
        latinName: 'Myrmecophila tibicinis',
        price: 128,
        images: [
            '/src/assets/images/img.png',
            '/src/assets/images/plant1-2.jpg',
            '/src/assets/images/plant1-3.jpg'
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 2,
        name: '蚁栖凤梨',
        latinName: 'Aechmea mariae-reginae',
        price: 158,
        images: [
            '/src/assets/images/plant2-1.jpg',
            '/src/assets/images/plant2-2.jpg',
            '/src/assets/images/plant2-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 3,
        name: '蚁栖兰',
        latinName: 'Lepanthes myrmecophila',
        price: 188,
        images: [
            '/src/assets/images/plant3-1.jpg',
            '/src/assets/images/plant3-2.jpg',
            '/src/assets/images/plant3-3.jpg'
        ],
        sizes: ['S', 'M']
    },
    {
        id: 4,
        name: '蚁栖芋',
        latinName: 'Colocasia myrmecophila',
        price: 98,
        images: [
            '/src/assets/images/plant4-1.jpg',
            '/src/assets/images/plant4-2.jpg',
            '/src/assets/images/plant4-3.jpg'
        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 5,
        name: '蚁栖榕',
        latinName: 'Ficus myrmecophila',
        price: 168,
        images: [
            '/src/assets/images/plant5-1.jpg',
            '/src/assets/images/plant5-2.jpg',
            '/src/assets/images/plant5-3.jpg'
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 6,
        name: '蚁栖竹',
        latinName: 'Bambusa myrmecophila',
        price: 118,
        images: [
            '/src/assets/images/plant6-1.jpg',
            '/src/assets/images/plant6-2.jpg',
            '/src/assets/images/plant6-3.jpg'
        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 7,
        name: '蚁栖蕨',
        latinName: 'Platycerium myrmecophila',
        price: 148,
        images: [
            '/src/assets/images/plant7-1.jpg',
            '/src/assets/images/plant7-2.jpg',
            '/src/assets/images/plant7-3.jpg'
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 8,
        name: '蚁栖草',
        latinName: 'Hydnophytum formicarum',
        price: 138,
        images: [
            '/src/assets/images/plant8-1.jpg',
            '/src/assets/images/plant8-2.jpg',
            '/src/assets/images/plant8-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL']
    }
];

export default function PlantGrid() {
    return (
        <div className="row">
            {plantsData.map(plant => (
                <PlantCard key={plant.id} plant={plant}/>
            ))}
        </div>
    );
}