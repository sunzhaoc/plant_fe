import {Link} from 'react-router-dom';
import DBCachedImage from 'src/components/UI/DBCachedImage';
import styles from 'src/components/Plants/PlantCard.module.css';

/**
 * 植物卡片数据类型接口
 * 定义单个植物卡片所需的核心数据字段
 */
interface Plant {
    plantId: string | number;
    plantName: string;
    plantLatinName: string;
    plantMinPrice: number;
    plantStock: number;
    plantTag?: string;
    plantMainImgUrl: string;
}

/**
 * 植物卡片展示组件
 * 展示植物核心信息，支持跳转详情页，根据库存状态展示不同样式/文案
 * @param {Object} props - 组件属性
 * @param {Plant} props.plant - 植物数据（遵循Plant接口）
 * @returns {JSX.Element} 渲染后的植物卡片
 */
export default function PlantCard({plant}: { plant: Plant }) {
    // 判断植物是否售罄（库存为0）
    const isStockOut = plant.plantStock === 0;

    return (
        <>
            <div className="col-md-3 mb-5">
                {/* 卡片外层容器（徽章定位父级） */}
                <div className={styles.plantCardWrapper}>
                    {/* 状态徽章：售罄/普通标签 */}
                    {isStockOut ? (
                        <div className={styles.plantSoldOutBadge}>SOLD OUT</div>
                    ) : (
                        plant.plantTag && <div className={styles.plantTagBadge}>{plant.plantTag}</div>
                    )}

                    {/* 卡片主体（售罄时添加置灰样式） */}
                    <div className={`${styles.plantCard} h-100 ${isStockOut ? styles.plantOutOfStock : ''}`}>
                        {/* 植物图片区域 */}
                        <div className={styles.plantImgWrapper}>
                            <Link
                                to={`/detail/${plant.plantId}`}
                                state={{mainPlantInfo: plant}}
                            >
                                <DBCachedImage
                                    url={plant.plantMainImgUrl}
                                    params="?image_process=resize,h_260"
                                    alt={plant.plantName}
                                    className="plantCardImg"
                                />
                            </Link>
                        </div>

                        {/* 卡片内容区 */}
                        <div className={`${styles.plantCardContent} d-flex flex-column`}>
                            {/* 植物名称（跳转详情） */}
                            <Link
                                to={`/detail/${plant.plantId}`}
                                className={styles.plantNameLink}
                                state={{mainPlantInfo: plant}}
                            >
                                <h5 className={`${styles.plantCardName} ${styles.textTruncate}`}>
                                    {plant.plantName}
                                </h5>
                            </Link>

                            {/* 拉丁学名（文本截断） */}
                            <p className={`${styles.plantLatinName} ${styles.textTruncate}`}>
                                {plant.plantLatinName}
                            </p>

                            {/* 卡片底部：价格 + 操作按钮 */}
                            <div className={styles.plantCardFooter}>
                                {/* 价格展示 */}
                                <span className={styles.plantPriceText}>¥ {plant.plantMinPrice}</span>

                                {/* 操作按钮（购买/补货中） */}
                                <Link
                                    to={`/detail/${plant.plantId}`}
                                    className={`${styles.plantActionBtn} ${isStockOut ? styles.plantDisabledBtn : ''}`}
                                    state={{mainPlantInfo: plant}}
                                >
                                    {isStockOut ? '补货中' : '购买'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}