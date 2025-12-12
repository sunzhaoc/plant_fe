import PlantCard from './PlantCard';

// 模拟植物数据
export const plantsData = [
    {
        id: 1,
        name: '大王蚁堡',
        latinName: 'Squamellaria major',
        price: 2000,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria major/img.png',
            '/src/assets/images/Squamellaria/Squamellaria major/img_1.png',
            '/src/assets/images/Squamellaria/Squamellaria major/img_2.png',
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 2,
        name: '发动机蚁堡',
        latinName: 'Squamellaria kajewskli',
        price: 2800,
        images: [
            '/src/assets/images/plant2-1.jpg',
            '/src/assets/images/plant2-2.jpg',
            '/src/assets/images/plant2-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 3,
        name: '赫胥黎蚁堡',
        latinName: 'Squamellaria huxleyana',
        price: 3000,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria huxleyana/img.png',
            '/src/assets/images/Squamellaria/Squamellaria huxleyana/img_1.png',
        ],
        sizes: ['S', 'M']
    },
    {
        id: 4,
        name: '格雷蚁堡',
        latinName: 'Squamellaria grayi',
        price: 98,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria grayi/img.png',
            '/src/assets/images/Squamellaria/Squamellaria grayi/img_1.png',
        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 5,
        name: '古皮蚁堡',
        latinName: 'Squamellaria guppyanum',
        price: 2680,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria guppyanum/img.png',
            '/src/assets/images/Squamellaria/Squamellaria guppyanum/img_1.png',
            '/src/assets/images/Squamellaria/Squamellaria guppyanum/img_2.png',
            '/src/assets/images/Squamellaria/Squamellaria guppyanum/img_3.png',
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 6,
        name: '海参蚁堡',
        latinName: 'Squamellaria imberbis',
        price: 118,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria imberbis/img.png',
            '/src/assets/images/Squamellaria/Squamellaria imberbis/img_1.png',
            '/src/assets/images/Squamellaria/Squamellaria imberbis/img_2.png',
        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 8,
        name: '特基蚁堡',
        latinName: 'Squamellaria thekii',
        price: 138,
        images: [
            '/src/assets/images/plant8-1.jpg',
            '/src/assets/images/plant8-2.jpg',
            '/src/assets/images/plant8-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 9,
        name: '杰布蚁堡',
        latinName: 'Squamellaria jebbiana',
        price: 138,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria jebbiana/img.png',
            '/src/assets/images/Squamellaria/Squamellaria jebbiana/img_1.png',
            '/src/assets/images/Squamellaria/Squamellaria jebbiana/img_2.png',
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 10,
        name: '细花蚁堡',
        latinName: 'Squamellaria tenuiflora',
        price: 138,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria tenuiflora/img.png',
            '/src/assets/images/Squamellaria/Squamellaria tenuiflora/img_1.png',
            '/src/assets/images/Squamellaria/Squamellaria tenuiflora/img_2.png',
            '/src/assets/images/Squamellaria/Squamellaria tenuiflora/img_3.png',
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 11,
        name: '瓦努阿图蚁堡',
        latinName: 'Squamellaria vanuatuensis',
        price: 138,
        images: [
            '/src/assets/images/plant8-1.jpg',
            '/src/assets/images/plant8-2.jpg',
            '/src/assets/images/plant8-3.jpg'
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 12,
        name: '威尔逊蚁堡',
        latinName: 'Squamellaria vanuatuensis',
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
                <PlantCard key={plant.id} plant={plant} />
            ))}
        </div>
    );
}