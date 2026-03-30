import {Link} from 'react-router-dom';
import DBCachedImage from 'src/components/UI/DBCachedImage';
import styles from 'src/components/Plants/PlantCard.module.css';

/**
 * 植物卡片数据类型接口
 * 定义了单个植物卡片所需的所有数据字段
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
 * 用于展示单个植物的核心信息（名称、价格、图片等），支持跳转详情页，且会根据库存状态展示不同样式/文案
 * @param {Object} props - 组件属性
 * @param {Plant} props.plant - 单个植物的完整数据，遵循Plant接口定义
 * @returns {JSX.Element} 渲染后的植物卡片组件
 */
export default function PlantCard({plant}: { plant: Plant }) {
    // 判断当前植物是否售罄（库存为0即判定为售罄）
    const isOutOfStock = plant.plantStock === 0;
    return (
        <>
            {/* 网格布局：每4列展示一个卡片，底部间距mb-5 */}
            <div className="col-md-3 mb-5">
                {/* 卡片外层容器，用于包裹徽章和卡片主体 */}
                <div className={styles.plantCardContainer}>
                    {/* 植物标签渲染：如果有标签则展示标签徽章 */}
                    {isOutOfStock ? (
                        // 售罄状态：仅展示售罄徽章
                        <div className={styles.soldOutBadge}>SOLD OUT</div>
                    ) : (
                        // 在售状态：有标签才展示标签徽章
                        plant.plantTag && <div className={styles.tagBadge}>{plant.plantTag}</div>
                    )}

                    {/* 卡片主体容器：设置高度100%，售罄时添加特殊样式 */}
                    <div className={`${styles.plantCard} h-100 ${isOutOfStock ? styles.outOfStock : ''}`}>
                        {/* 植物图片区域 */}
                        <div className={styles.plantImgContainer}>
                            {/* 图片跳转链接：点击图片跳转到植物详情页，携带植物基础信息 */}
                            <Link
                                to={`/detail/${plant.plantId}`}
                                state={{mainPlantInfo: plant}}
                            >
                                {/* 自定义图片组件：设置图片尺寸、替代文本，优化加载 */}
                                <DBCachedImage
                                    url={plant.plantMainImgUrl}
                                    params="?image_process=resize,h_260" // 图片处理参数：固定高度260px
                                    alt={plant.plantName} // 图片替代文本，提升可访问性
                                    className="plantCardImg"
                                />
                            </Link>
                        </div>

                        {/* 卡片内容区域：弹性布局，垂直排列 */}
                        <div className={`${styles.plantCardBody} d-flex flex-column`}>
                            {/* 植物中文名区域：点击跳转详情页 */}
                            <Link
                                to={`/detail/${plant.plantId}`}
                                className={styles.plantNameLink}
                                state={{mainPlantInfo: plant}}
                            >
                                <h5 className={`${styles.plantCardTitle} ${styles.textTruncate}`}>
                                    {plant.plantName}
                                </h5>
                            </Link>

                            {/* 植物拉丁学名区域：超出显示省略号 */}
                            <p className={`${styles.latinNameText} ${styles.textTruncate}`}>
                                {plant.plantLatinName}
                            </p>

                            {/* 卡片底部：价格展示 + 购买按钮区域 */}
                            <div className={styles.plantCardFooter}>
                                {/* 价格展示：显示植物最低售价 */}
                                <span className={styles.plantCardFooterPurchaseButton}>
                                    ¥ {plant.plantMinPrice}
                                </span>
                                {/* 购买/补货按钮：根据库存状态展示不同文案和样式，点击跳转详情页 */}
                                <Link
                                    to={`/detail/${plant.plantId}`}
                                    className={`${styles.addToCartBtn} ${isOutOfStock ? styles.disabledBtn : ''}`}
                                    state={{mainPlantInfo: plant}}
                                >
                                    {isOutOfStock ? '补货中' : '购买'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}