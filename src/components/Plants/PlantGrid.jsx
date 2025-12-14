import PlantCard from '/src/components/Plants/PlantCard';
import {useState} from 'react';

// 统一导入所有图片资源（解决打包后路径问题的核心）
// 蚁堡
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
// 蚁巢木
import myrmecodiaLamiiImg from '@/assets/images/Myrmecodia/Myrmecodia lamii/img.png';
import myrmecodiaBrassiiImg from '@/assets/images/Myrmecodia/Myrmecodia brassii/img.png';

// 蚁茎玉
import anthorrhizaChrysacanthaImg from '@/assets/images/Anthorrhiza/Anthorrhiza chrysacantha/img.png';
import anthorrhizaBracteosaImg from '@/assets/images/Anthorrhiza/Anthorrhiza bracteosa/img.png';

// 蚁寨
import hydnophytumCaminiferumImg from '@/assets/images/Hydnophytum/Hydnophytum caminiferum/img.png';
import hydnophytum_sp_aff_ovatum__aimas_sorong_west_papua_Img
    from '@/assets/images/Hydnophytum/hydnophytum_sp_aff_ovatum__aimas_sorong_west_papua/img.png';

// 植物数据常量（使用导入的图片变量，确保打包后路径正确）
export const plantsData = [
    // {
    //     id: 20,
    //     name: '与卵形蚁寨相似的未定种蚁寨',
    //     latinName: 'Hydnophytum sp. aff. ovatum Aimas, Sorong, West Papua',
    //     price: 800,
    //     imageKeys: ['plant/squamellaria/squamellaria_grayi/img.png'],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 19,
    //     name: '烟囱蚁寨',
    //     latinName: 'Hydnophytum caminiferum',
    //     price: 800,
    //     imageKeys: ['plant/squamellaria/squamellaria_grayi/img.png'],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 17,
    //     name: '曲脊蚁茎玉（？）',
    //     latinName: 'Anthorrhiza recurvispina (?) (Missima Island, PNG)',
    //     price: 2800,
    //     imageKeys: ['plant/squamellaria/squamellaria_grayi/img.png'],
    //     sizes: ['S', 'M', 'L']
    // },
    //
    // {
    //     id: 18,
    //     name: '巴氏蚁巢木',
    //     latinName: 'Myrmecodia brassii',
    //     price: 3000,
    //     imageKeys: [
    //         myrmecodiaBrassiiImg
    //     ],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 16,
    //     name: '方茎蚁茎玉',
    //     latinName: 'Anthorrhiza bracteosa (Normanby, PNG)',
    //     price: 450,
    //     imageKeys: [
    //         anthorrhizaBracteosaImg
    //     ],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 1,
    //     name: '大王蚁堡',
    //     latinName: 'Squamellaria major',
    //     price: 5000.54,
    //     imageKeys: [
    //         squamellariaMajorImg1,
    //         squamellariaMajorImg2,
    //         squamellariaMajorImg,
    //         squamellariaMajorImg,
    //     ],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 2,
    //     name: '发动机蚁堡',
    //     latinName: 'Squamellaria kajewskli (Bugainville Island, PNG)',
    //     price: 2000,
    //     imageKeys: [
    //         squamellariaKajewskliImg,
    //         squamellariaKajewskliImg1,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 3,
    //     name: '赫胥黎蚁堡',
    //     latinName: 'Squamellaria huxleyana (Vanua Levu, Fiji)',
    //     price: 3500,
    //     imageKeys: [
    //         squamellariaHuxleyanaImg,
    //         squamellariaHuxleyanaImg1,
    //     ],
    //     sizes: ['S', 'M']
    // },
    {
        id: 4,
        name: '格雷蚁堡',
        latinName: 'Squamellaria grayi (Taveuni Island, Fiji)',
        price: 7000,
        imgUrl: [
            "plant/squamellaria/squamellaria_grayi/img.png",

        ],
        sizes: ['M', 'L', 'XL']
    },
    {
        id: 5,
        name: '古皮蚁堡',
        latinName: 'Squamellaria guppyanum (Bugainville Island, PNG)',
        price: 3500,
        imgUrl: [
            "plant/squamellaria/squamellaria_guppyanum/img.png",
            "plant/squamellaria/squamellaria_guppyanum/img_1.png",
            "plant/squamellaria/squamellaria_guppyanum/img_2.png"
        ],
        sizes: ['S', 'M', 'L']
    },
    {
        id: 6,
        name: '海参蚁堡',
        latinName: 'Squamellaria imberbis (Vanua Levu, Fiji)',
        price: 3600,
        imgUrl: [],
        sizes: ['M', 'L', 'XL']
    },
    // {
    //     id: 8,
    //     name: '特基蚁堡',
    //     latinName: 'Squamellaria thekii (Taveuni, Fiji)',
    //     price: 4800,
    //     imageKeys: [
    //         squamellariaThekiiImg,
    //         squamellariaThekiiImg1,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 9,
    //     name: '杰布蚁堡',
    //     latinName: 'Squamellaria jebbiana',
    //     price: 8000,
    //     imageKeys: [
    //         squamellariaJebbianaImg,
    //         squamellariaJebbianaImg1,
    //         squamellariaJebbianaImg2,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 10,
    //     name: '细花蚁堡',
    //     latinName: 'Squamellaria tenuiflora',
    //     price: 3500,
    //     imageKeys: [
    //         squamellariaTenuifloraImg,
    //         squamellariaTenuifloraImg1,
    //         squamellariaTenuifloraImg2,
    //         squamellariaTenuifloraImg3,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 11,
    //     name: '瓦努阿图蚁堡',
    //     latinName: 'Squamellaria vanuatuensis',
    //     price: 6500,
    //     imageKeys: [
    //         squamellariaVanuatuensisImg,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 12,
    //     name: '威尔逊蚁堡',
    //     latinName: 'Squamellaria wilsonii (Taveuni, Fiji)',
    //     price: 5000,
    //     imageKeys: [
    //         squamellariaWilsoniiImg,
    //         squamellariaWilsoniiImg1,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 13,
    //     name: '威尔金森蚁堡',
    //     latinName: 'Squamellaria wilkinsonii',
    //     price: 8000,
    //     imageKeys: [
    //      's'
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 14,
    //     name: '蓝姆蚁巢木',
    //     latinName: 'Myrmecodia lamii',
    //     price: 4500,
    //     imageKeys: [
    //         myrmecodiaLamiiImg,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 15,
    //     name: '金刺蚁茎玉',
    //     latinName: 'Anthorrhiza chrysacantha Mt. Kaindi, PNG',
    //     price: 1200,
    //     imageKeys: [
    //         anthorrhizaChrysacanthaImg,
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // }
];

// 提取所有独特的属名（从拉丁名中提取第一个单词）
const getGenera = (plants) => {
    const genera = new Set();
    plants.forEach(plant => {
        const genus = plant.latinName.split(' ')[0];
        genera.add(genus);
    });
    return ['全部', ...Array.from(genera)];
};


export default function PlantGrid() {
    const [selectedGenus, setSelectedGenus] = useState('全部');
    const genera = getGenera(plantsData);

    // 根据选中的属名筛选植物
    const filteredPlants = selectedGenus === '全部'
        ? plantsData
        : plantsData.filter(plant =>
            plant.latinName.split(' ')[0] === selectedGenus
        );

    return (
        <div>
            {/* 属名筛选栏 */}
            <div className="mb-4 genus-filter">
                <div className="d-flex flex-wrap gap-2">
                    {genera.map(genus => (
                        <button
                            key={genus}
                            className={`btn genus-btn ${selectedGenus === genus ? 'active' : ''}`}
                            onClick={() => setSelectedGenus(genus)}
                        >
                            {genus}
                        </button>
                    ))}
                </div>
            </div>

            {/* 植物网格 */}
            <div className="row">
                {filteredPlants.map(plant => (
                    <PlantCard key={plant.id} plant={plant} />
                ))}
            </div>
        </div>
    );
}