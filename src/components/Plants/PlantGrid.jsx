import PlantCard from '/src/components/Plants/PlantCard';
// 统一导入所有图片资源（解决打包后路径问题的核心）
import squamellariaMajorImg1 from '@/assets/images/Squamellaria/Squamellaria major/img_1.png';
import squamellariaMajorImg2 from '@/assets/images/Squamellaria/Squamellaria major/img_2.png';
import squamellariaMajorImg from '@/assets/images/Squamellaria/Squamellaria major/img.png';
import squamellariaKajewskliImg from '@/assets/images/Squamellaria/Squamellaria kajewskli/img.png';
import squamellariaKajewskliImg1 from '@/assets/images/Squamellaria/Squamellaria kajewskli/img_1.png';
import squamellariaHuxleyanaImg from '@/assets/images/Squamellaria/Squamellaria huxleyana/img.png';
import squamellariaHuxleyanaImg1 from '@/assets/images/Squamellaria/Squamellaria huxleyana/img_1.png';
import squamellariaGrayiImg from '@/assets/images/Squamellaria/Squamellaria grayi/img.png';
import squamellariaGrayiImg1 from '@/assets/images/Squamellaria/Squamellaria grayi/img_1.png';
import squamellariaGuppyanumImg from '@/assets/images/Squamellaria/Squamellaria guppyanum/img.png';
import squamellariaGuppyanumImg1 from '@/assets/images/Squamellaria/Squamellaria guppyanum/img_1.png';
import squamellariaGuppyanumImg2 from '@/assets/images/Squamellaria/Squamellaria guppyanum/img_2.png';
import squamellariaGuppyanumImg3 from '@/assets/images/Squamellaria/Squamellaria guppyanum/img_3.png';
import squamellariaImberbisImg from '@/assets/images/Squamellaria/Squamellaria imberbis/img.png';
import squamellariaImberbisImg1 from '@/assets/images/Squamellaria/Squamellaria imberbis/img_1.png';
import squamellariaImberbisImg2 from '@/assets/images/Squamellaria/Squamellaria imberbis/img_2.png';
import squamellariaThekiiImg from '@/assets/images/Squamellaria/Squamellaria thekii/img.png';
import squamellariaThekiiImg1 from '@/assets/images/Squamellaria/Squamellaria thekii/img_1.png';
import squamellariaJebbianaImg from '@/assets/images/Squamellaria/Squamellaria jebbiana/img.png';
import squamellariaJebbianaImg1 from '@/assets/images/Squamellaria/Squamellaria jebbiana/img_1.png';
import squamellariaJebbianaImg2 from '@/assets/images/Squamellaria/Squamellaria jebbiana/img_2.png';
import squamellariaTenuifloraImg from '@/assets/images/Squamellaria/Squamellaria tenuiflora/img.png';
import squamellariaTenuifloraImg1 from '@/assets/images/Squamellaria/Squamellaria tenuiflora/img_1.png';
import squamellariaTenuifloraImg2 from '@/assets/images/Squamellaria/Squamellaria tenuiflora/img_2.png';
import squamellariaTenuifloraImg3 from '@/assets/images/Squamellaria/Squamellaria tenuiflora/img_3.png';
import squamellariaVanuatuensisImg from '@/assets/images/Squamellaria/Squamellaria vanuatuensis/img.png';
import squamellariaWilsoniiImg from '@/assets/images/Squamellaria/Squamellaria wilsonii/img.png';
import squamellariaWilsoniiImg1 from '@/assets/images/Squamellaria/Squamellaria wilsonii/img_1.png';

// 植物数据常量（使用导入的图片变量，确保打包后路径正确）
export const plantsData = [
    {
        id: 1,
        name: '大王蚁堡',
        latinName: 'Squamellaria major',
        price: 5000.54,
        images: [
            squamellariaMajorImg1,
            squamellariaMajorImg2,
            squamellariaMajorImg,
            squamellariaMajorImg,
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 2,
        name: '发动机蚁堡',
        latinName: 'Squamellaria kajewskli',
        price: 2000,
        images: [
            squamellariaKajewskliImg,
            squamellariaKajewskliImg1,
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 3,
        name: '赫胥黎蚁堡',
        latinName: 'Squamellaria huxleyana',
        price: 3500,
        images: [
            squamellariaHuxleyanaImg,
            squamellariaHuxleyanaImg1,
        ],
        sizes: ['S', 'M']
    },
    {
        id: 4,
        name: '格雷蚁堡',
        latinName: 'Squamellaria grayi',
        price: 7000,
        images: [
            squamellariaGrayiImg,
            squamellariaGrayiImg1,
        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 5,
        name: '古皮蚁堡',
        latinName: 'Squamellaria guppyanum',
        price: 3500,
        images: [
            squamellariaGuppyanumImg,
            squamellariaGuppyanumImg1,
            squamellariaGuppyanumImg2,
            squamellariaGuppyanumImg3,
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 6,
        name: '海参蚁堡',
        latinName: 'Squamellaria imberbis',
        price: 3600,
        images: [
            squamellariaImberbisImg,
            squamellariaImberbisImg1,
            squamellariaImberbisImg2,
        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 8,
        name: '特基蚁堡',
        latinName: 'Squamellaria thekii',
        price: 4800,
        images: [
            squamellariaThekiiImg,
            squamellariaThekiiImg1,
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 9,
        name: '杰布蚁堡',
        latinName: 'Squamellaria jebbiana',
        price: 8000,
        images: [
            squamellariaJebbianaImg,
            squamellariaJebbianaImg1,
            squamellariaJebbianaImg2,
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 10,
        name: '细花蚁堡',
        latinName: 'Squamellaria tenuiflora',
        price: 3500,
        images: [
            squamellariaTenuifloraImg,
            squamellariaTenuifloraImg1,
            squamellariaTenuifloraImg2,
            squamellariaTenuifloraImg3,
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 11,
        name: '瓦努阿图蚁堡',
        latinName: 'Squamellaria vanuatuensis',
        price: 6500,
        images: [
            squamellariaVanuatuensisImg,
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 12,
        name: '威尔逊蚁堡',
        latinName: 'Squamellaria wilsonii',
        price: 5000,
        images: [
            squamellariaWilsoniiImg,
            squamellariaWilsoniiImg1,
        ],
        sizes: ['S', 'M', 'L', 'XL']
    },
    {
        id: 13,
        name: '威尔金森蚁堡',
        latinName: 'Squamellaria wilkinsonii',
        price: 8000,
        images: [
            // squamellariaWilkinsoniiImg,
            // squamellariaWilkinsoniiImg1,
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