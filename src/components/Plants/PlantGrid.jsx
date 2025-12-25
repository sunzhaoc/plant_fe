import PlantCard from '/src/components/Plants/PlantCard';
import {useEffect, useState} from 'react';
import api from "/src/utils/api.jsx";

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
    {
        id: 17,
        name: '曲脊蚁茎玉（？）',
        latinName: 'Anthorrhiza recurvispina (?) (Missima Island, PNG)',
        price: 2800,
        imgUrl: [],
        sizes: [
            {size: 'S', price: 450.00},
            {size: 'M', price: 500.00},
        ]
    },
    {
        id: 18,
        name: '巴氏蚁巢木',
        latinName: 'Myrmecodia brassii',
        imgUrl: [
            "plant/myrmecodia/myrmecodia_brassii/img.png",
        ],
        sizes: [
            {size: 'S', price: 450.00},
            {size: 'M', price: 500.00},
        ]
    },
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
    {
        id: 1,
        name: '大王蚁堡',
        latinName: 'Squamellaria major',
        imgUrl: [
            "plant/squamellaria/squamellaria_major/img_1.png",
            "plant/squamellaria/squamellaria_major/img.png",
        ],
        sizes: [
            {size: 'S', price: 450.00},
            {size: 'M', price: 500.00},
        ]
    },
    {
        id: 2,
        name: '发动机蚁堡',
        latinName: 'Squamellaria kajewskli (Bugainville Island, PNG)',
        imgUrl: [
            "plant/squamellaria/squamellaria_kajewskli/img_2.jpg",
            "plant/squamellaria/squamellaria_kajewskli/img.png",
            "plant/squamellaria/squamellaria_kajewskli/img_1.png",
        ],
        sizes: [
            {size: 'S', price: 450.00},
            {size: 'M', price: 500.00},
        ]
    },
    {
        id: 3,
        name: '赫胥黎蚁堡',
        latinName: 'Squamellaria huxleyana (Vanua Levu, Fiji)',
        imgUrl: [
            "plant/squamellaria/squamellaria_huxleyana/img.png",
            "plant/squamellaria/squamellaria_huxleyana/img_1.png",
        ],
        sizes: [
            {size: 'S', price: 450.00},
            {size: 'M', price: 500.00},
        ]
    },
    {
        id: 4,
        name: '格雷蚁堡',
        latinName: 'Squamellaria grayi (Taveuni Island, Fiji)',
        imgUrl: [
            "plant/squamellaria/squamellaria_grayi/img_3.jpg",
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
            "plant/squamellaria/squamellaria_guppyanum/img_4.jpg",
            "plant/squamellaria/squamellaria_guppyanum/img_3.jpg",

        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    {
        id: 6,
        name: '海参蚁堡',
        latinName: 'Squamellaria imberbis (Vanua Levu, Fiji)',
        imgUrl: [
            "plant/squamellaria/squamellaria_imberbis/img.png",
            "plant/squamellaria/squamellaria_imberbis/img_1.png",
        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    {
        id: 8,
        name: '特基蚁堡',
        latinName: 'Squamellaria thekii (Taveuni, Fiji)',
        imgUrl: [
            "plant/squamellaria/squamellaria_thekii/img.png",

            "plant/squamellaria/squamellaria_thekii/original.jpeg",
            "plant/squamellaria/squamellaria_thekii/img_1.png",
        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    {
        id: 9,
        name: '杰布蚁堡',
        latinName: 'Squamellaria jebbiana',
        imgUrl: [
            "plant/squamellaria/squamellaria_jebbiana/img_3.jpg",
            "plant/squamellaria/squamellaria_jebbiana/img_4.jpg"
        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    {
        id: 10,
        name: '细花蚁堡',
        latinName: 'Squamellaria tenuiflora',
        imgUrl: [
            "plant/squamellaria/squamellaria_tenuiflora/img_4.jpg",
            "plant/squamellaria/squamellaria_tenuiflora/img_5.jpg"
        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    {
        id: 11,
        name: '瓦努阿图蚁堡',
        latinName: 'Squamellaria vanuatuensis',
        imgUrl: [
            "plant/squamellaria/squamellaria_vanuatuensis/img_1.jpg",
            "plant/squamellaria/squamellaria_vanuatuensis/img_2.jpg",
            "plant/squamellaria/squamellaria_vanuatuensis/img_3.jpg",
        ],
        sizes: [
            {size: 'S', price: 2000.00},
        ]
    },
    {
        id: 12,
        name: '威尔逊蚁堡',
        latinName: 'Squamellaria wilsonii (Taveuni, Fiji)',
        imgUrl: [
            "plant/squamellaria/squamellaria_wilsonii/original.jpeg",
            "plant/squamellaria/squamellaria_wilsonii/img.png",
            "plant/squamellaria/squamellaria_wilsonii/img_1.png",
        ],
        sizes: [
            {size: 'S', price: 4500.00},
            {size: 'M', price: 5000.03},
            {size: 'L', price: 6800.03},
        ]
    },
    {
        id: 13,
        name: '威尔金森蚁堡',
        latinName: 'Squamellaria wilkinsonii',
        imgUrl: ["plant/squamellaria/squamellaria_wilkinsonii/img.jpg"],
        sizes: [
            {size: 'S', price: 4500.00},
            {size: 'M', price: 5000.03},
            {size: 'L', price: 6800.03},
        ]
    },
    {
        id: 14,
        name: '蓝姆蚁巢木',
        latinName: 'Myrmecodia lamii',
        imgUrl: [
            "plant/myrmecodia/myrmecodia_lamii/img.png",
        ],
        sizes: [
            {size: 'S', price: 4500.00},
            {size: 'M', price: 5000.03},
            {size: 'L', price: 6800.03},
        ]
    },
    {
        id: 15,
        name: '金刺蚁茎玉',
        latinName: 'Anthorrhiza chrysacantha Mt. Kaindi, PNG',
        imgUrl: [
            "plant/anthorrhiza/anthorrhiza_chrysacantha/img.png",
        ],
        sizes: [
            {size: 'S', price: 4500.00},
            {size: 'M', price: 5000.03},
            {size: 'L', price: 6800.03},
        ]
    }
];

// 提取所有独特的属名（从拉丁名中提取第一个单词）
const getGenera = (plants) => {
    const genera = new Set();
    plants.forEach(plant => {
        if (!plant.latinName) return;
        const genus = plant.latinName.split(' ')[0];
        genera.add(genus);
    });
    return ['全部', ...Array.from(genera)];
};


export default function PlantGrid() {
    const [plantList, setPlantList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlants = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/plants');

                // 校验接口响应是否成功
                if (!response.data.success) {
                    throw new Error(response.data.message || "获取植物数据失败");
                }

                const transformedPlants = response.data.data.map(plant => ({
                    plantId: plant.plant_id,
                    plantName: plant.name,
                    plantLatinName: plant.latin_name,
                    plantMainImgUrl: plant.main_img_url ? plant.main_img_url : '',
                    plantMinPrice: plant.min_price,
                }));

                setPlantList(transformedPlants);
                setError(null);
            } catch (err) {
                setError(err.message || "网络异常，无法获取植物数据");
                setPlantList([]);
                console.error("获取植物数据失败：", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlants();
    }, []);


    const [selectedGenus, setSelectedGenus] = useState('全部');
    const genera = getGenera(plantList);

    // 根据选中的属名筛选植物
    const filteredPlants = selectedGenus === '全部'
        ? plantList
        : plantList.filter(plant => {
            if (!plant.latinName) return false;
            return plant.latinName.split(' ')[0] === selectedGenus;
        });

    // 加载状态提示
    if (loading) {
        return <div className="text-center py-8">正在加载植物数据...</div>;
    }

    // 错误状态提示
    if (error) {
        return <div className="text-center py-8 text-danger">{error}</div>;
    }

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
                    <PlantCard key={plant.plantId} plant={plant} />
                ))}
            </div>
        </div>
    );
}