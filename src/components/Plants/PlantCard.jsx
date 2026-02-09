import {Link} from 'react-router-dom';
import DBCachedImage from '/src/components/UI/DBCachedImage';
import styles from '/src/components/Plants/PlantCard.module.css';

export default function PlantCard({plant}) {
    return (<>
        <div className="col-md-3 mb-5">
            <div className={styles.plantCardContainer}>
                <div className={`${styles.plantCard} h-100`}>
                    <div className={styles.plantImgContainer}>
                        <Link
                            to={`/detail/${plant.plantId}`}
                            state={{mainPlantInfo: plant}}
                        >
                            <DBCachedImage
                                url={plant.plantMainImgUrl}
                                params="?image_process=resize,h_260" // 图片操作参数
                                alt={plant.plantName}
                                className="plantCardImg"
                            />
                        </Link>
                    </div>

                    <div className={`${styles.plantCardBody} d-flex flex-column`}>
                        {/* 中文名 */}
                        <Link
                            to={`/detail/${plant.plantId}`}
                            className={styles.plantNameLink}
                            state={{mainPlantInfo: plant}}
                        >
                            <h5 className={`${styles.plantCardTitle} ${styles.textTruncate}`}>
                                {plant.plantName}
                            </h5>
                        </Link>

                        {/* 拉丁学名 */}
                        <p className={`${styles.latinNameText} ${styles.textTruncate}`}>
                            {plant.plantLatinName}
                        </p>

                        {/* 价格按钮区 */}
                        <div className={styles.plantCardFooter}>
                            <span className={styles.plantCardFooterPurchaseButton}>
                                ¥ {plant.plantMinPrice}
                            </span>
                            <Link
                                to={`/detail/${plant.plantId}`}
                                className={styles.addToCartBtn}
                                state={{mainPlantInfo: plant}}
                            >
                                购买
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>);
}