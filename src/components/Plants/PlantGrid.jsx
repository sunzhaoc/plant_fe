import PlantCard from '/src/components/Plants/PlantCard';
import img1 from '@/assets/images/Squamellaria/Squamellaria major/img.png';

// 模拟植物数据
// eslint-disable-next-line react-refresh/only-export-components
export const plantsData = [
    {
        id: 1,
        name: '大王蚁堡',
        latinName: 'Squamellaria major',
        price: 5000,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria major/img_1.png',
            '/src/assets/images/Squamellaria/Squamellaria major/img_2.png',
            img1,
            '/src/assets/images/Squamellaria/Squamellaria major/img.png',
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 2,
        name: '发动机蚁堡',
        latinName: 'Squamellaria kajewskli',
        price: 2000,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria kajewskli/img.png',
            '/src/assets/images/Squamellaria/Squamellaria kajewskli/img_1.png',
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 3,
        name: '赫胥黎蚁堡',
        latinName: 'Squamellaria huxleyana',
        price: 3500,
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
        price: 7000,
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
        price: 3500,
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
        price: 3600,
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
        price: 4800,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria thekii/img.png',
            '/src/assets/images/Squamellaria/Squamellaria thekii/img_1.png',
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 9,
        name: '杰布蚁堡',
        latinName: 'Squamellaria jebbiana',
        price: 8000,
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
        price: 3500,
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
        price: 6500,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria vanuatuensis/img.png',
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 12,
        name: '威尔逊蚁堡',
        latinName: 'Squamellaria wilsonii',
        price: 5000,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria wilsonii/img.png',
            '/src/assets/images/Squamellaria/Squamellaria wilsonii/img_1.png',
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 13,
        name: '威尔金森蚁堡',
        latinName: 'Squamellaria wilkinsonii',
        price: 8000,
        images: [
            '/src/assets/images/Squamellaria/Squamellaria wilkinsonii/img.png',
            '/src/assets/images/Squamellaria/Squamellaria wilkinsonii/img_1.png',
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