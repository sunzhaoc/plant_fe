// plantCategories.tsx
/** 植物分类体系常量 */
export const topLevelCategories = {
    'Ant-Rubiaceae & Caudiciforms': {
        'Myrmecophytic Rubiaceae 蚁栖茜草群': ['Anthorrhiza', 'Hydnophytum', 'Myrmecodia', 'Myrmephytum', 'Squamellaria'],
    },
    'Episodic Gesneriads & Ericads': {
        'Epiphytic Gesneriads 附生苦苣苔群': ['Aeschynanthus', 'Agalmyla', 'Codonanthopsis', 'Columnea', 'Drymonia', 'Glossoloma', 'Nautilocalyx', 'Pachycaulos', 'Pearcea', 'Trichodrymonia'],
        'Epiphytic Ericaceae 附生杜鹃群': ['Ceratostema', 'Disterigma', 'Macleania', 'Agapetes', 'Plutarchia', 'Semiramisia', 'Themistoclesia'],
    },
    'Epiphytic Ferns': {
        'Polypodiaceae & Ferns 水龙骨与蕨群': ['Blechnum', 'Doodia', 'Drynaria', 'Lecanopteris', 'Lepisorus', 'Microgramma', 'Pneumatopteris', 'Selaginella', 'Serpocaulon', 'Solanopteris', 'Tectaria'],
    },
    'Apocynaceae & Climbers': {
        "Asclepiads 萝藦亚科群": ["Dischidia", "Hoya", "Phyllanthera"]
    },
    "Orchids": {
        "Orchidaceae 兰科": ["Bulbophyllum", "Dendrobium", "Phalaenopsis"]
    },
    "Miscellaneous": {
        "Rainforest Understory 雨林底层与附生综合群": ["Begonia", "Medinilla", "Pachycentria", "Peperomia", "Poikilogyne", "Tococa"],
        "Terrestrial & Shrubby 地生与灌木群": ["Arthropodium", "Cecropia", "Lycianthes", "Macaranga", "Tacca"]
    }
};

/**
 * 工具函数：获取分类体系中第一个有效属名
 * @returns {string|undefined} 第一个属名，无数据时返回undefined
 */
export const getFirstGenus = (): string | undefined => {
    for (const group of Object.values(topLevelCategories)) {
        for (const generaArray of Object.values(group)) {
            if (generaArray?.length > 0) return generaArray[0];
        }
    }
    return undefined;
};

/**
 * 工具函数：根据属名查找其所属的顶级分类
 * @param {string} targetGenus - 目标属名
 * @returns {string|undefined} 匹配的顶级分类名，未找到返回undefined
 */
export const findTopCategoryForGenus = (targetGenus: string): string | undefined => {
    for (const [topCategory, groups] of Object.entries(topLevelCategories)) {
        for (const [, genusList] of Object.entries(groups)) {
            if (genusList.includes(targetGenus)) {
                return topCategory;
            }
        }
    }
    return undefined;
};

/** 预先计算所有属名 */
export const allGenera = ((): string[] => {
    const generaSet = new Set<string>();
    Object.values(topLevelCategories).forEach(group => {
        Object.values(group || {}).forEach(generaList => {
            generaList?.forEach(genus => {
                if (genus) generaSet.add(genus);
            });
        });
    });
    return Array.from(generaSet);
})();