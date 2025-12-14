import PlantCard from '/src/components/Plants/PlantCard';
import {useState} from 'react';

// 植物数据常量（使用导入的图片变量，确保打包后路径正确）
export const plantsData = [
    // {
    //     id: 20,
    //     name: '与卵形蚁寨相似的未定种蚁寨',
    //     latinName: 'Hydnophytum sp. aff. ovatum Aimas, Sorong, West Papua',
    //     price: 800,
    //     imgUrl: ['plant/squamellaria/squamellaria_grayi/img.png'],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 19,
    //     name: '烟囱蚁寨',
    //     latinName: 'Hydnophytum caminiferum',
    //     price: 800,
    //     imgUrl: ['plant/squamellaria/squamellaria_grayi/img.png'],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 17,
    //     name: '曲脊蚁茎玉（？）',
    //     latinName: 'Anthorrhiza recurvispina (?) (Missima Island, PNG)',
    //     price: 2800,
    //     imgUrl: [],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 18,
    //     name: '巴氏蚁巢木',
    //     latinName: 'Myrmecodia brassii',
    //     price: 3000,
    //     imgUrl: [
    //         "plant/myrmecodia/myrmecodia_brassii/img.png",
    //     ],
    //     sizes: ['S', 'M', 'L']
    // },
    {
        id: 16,
        name: '方茎蚁茎玉',
        latinName: 'Anthorrhiza bracteosa (Normanby, PNG)',
        imgUrl: [
            "plant/anthorrhiza/anthorrhiza_bracteosa/img.png",
        ],
        sizes: [
            {size: 'S', price: 450.00},
            {size: 'M', price: 500.00},
        ]
    },
    // {
    //     id: 1,
    //     name: '大王蚁堡',
    //     latinName: 'Squamellaria major',
    //     price: 5000.54,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_major/img.png",
    //         "plant/squamellaria/squamellaria_major/img_1.png",
    //     ],
    //     sizes: ['S', 'M', 'L']
    // },
    // {
    //     id: 2,
    //     name: '发动机蚁堡',
    //     latinName: 'Squamellaria kajewskli (Bugainville Island, PNG)',
    //     price: 2000,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_kajewskli/img.png",
    //         "plant/squamellaria/squamellaria_kajewskli/img_1.png",
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 3,
    //     name: '赫胥黎蚁堡',
    //     latinName: 'Squamellaria huxleyana (Vanua Levu, Fiji)',
    //     price: 3500,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_huxleyana/img.png",
    //         "plant/squamellaria/squamellaria_huxleyana/img_1.png",
    //     ],
    //     sizes: ['S', 'M']
    // },
    {
        id: 4,
        name: '格雷蚁堡',
        latinName: 'Squamellaria grayi (Taveuni Island, Fiji)',
        imgUrl: [
            "plant/squamellaria/squamellaria_grayi/img.png",
        ],
        sizes: [
            {size: 'S', price: 4500.00},
            {size: 'M', price: 5000.03},
            {size: 'L', price: 6800.03},
        ]
    },
    {
        id: 5,
        name: '古皮蚁堡',
        latinName: 'Squamellaria guppyanum (Bugainville Island, PNG)',
        imgUrl: [
            "plant/squamellaria/squamellaria_guppyanum/img.png",
            "plant/squamellaria/squamellaria_guppyanum/img_1.png",
            "plant/squamellaria/squamellaria_guppyanum/img_2.png"
        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    // {
    //     id: 6,
    //     name: '海参蚁堡',
    //     latinName: 'Squamellaria imberbis (Vanua Levu, Fiji)',
    //     price: 3600,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_imberbis/img.png",
    //         "plant/squamellaria/squamellaria_imberbis/img_1.png",
    //     ],
    //     sizes: ['M', 'L', 'XL']
    // },
    // {
    //     id: 8,
    //     name: '特基蚁堡',
    //     latinName: 'Squamellaria thekii (Taveuni, Fiji)',
    //     price: 4800,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_thekii/img.png",
    //         "plant/squamellaria/squamellaria_thekii/img_1.png",
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 9,
    //     name: '杰布蚁堡',
    //     latinName: 'Squamellaria jebbiana',
    //     price: 8000,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_jebbiana/img.png",
    //         "plant/squamellaria/squamellaria_jebbiana/img_1.png",
    //         "plant/squamellaria/squamellaria_jebbiana/img_2.png"
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 10,
    //     name: '细花蚁堡',
    //     latinName: 'Squamellaria tenuiflora',
    //     price: 3500,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_tenuiflora/img.png",
    //         "plant/squamellaria/squamellaria_tenuiflora/img_1.png",
    //         "plant/squamellaria/squamellaria_tenuiflora/img_2.png",
    //         "plant/squamellaria/squamellaria_tenuiflora/img_3.png",
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 11,
    //     name: '瓦努阿图蚁堡',
    //     latinName: 'Squamellaria vanuatuensis',
    //     price: 6500,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_vanuatuensis/img.png",
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 12,
    //     name: '威尔逊蚁堡',
    //     latinName: 'Squamellaria wilsonii (Taveuni, Fiji)',
    //     price: 5000,
    //     imgUrl: [
    //         "plant/squamellaria/squamellaria_wilsonii/img.png",
    //         "plant/squamellaria/squamellaria_wilsonii/img_1.png",
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 13,
    //     name: '威尔金森蚁堡',
    //     latinName: 'Squamellaria wilkinsonii',
    //     price: 8000,
    //     imgUrl: [],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 14,
    //     name: '蓝姆蚁巢木',
    //     latinName: 'Myrmecodia lamii',
    //     price: 4500,
    //     imgUrl: [
    //         "plant/myrmecodia/myrmecodia_lamii/img.png",
    //     ],
    //     sizes: ['S', 'M', 'L', 'XL']
    // },
    // {
    //     id: 15,
    //     name: '金刺蚁茎玉',
    //     latinName: 'Anthorrhiza chrysacantha Mt. Kaindi, PNG',
    //     price: 1200,
    //     imgUrl: [
    //         "plant/anthorrhiza/anthorrhiza_chrysacantha/img.png",
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