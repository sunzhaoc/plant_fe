import {Link} from 'react-router-dom';
import DBCachedImage from '/src/components/UI/DBCachedImage';

export default function PlantCard({plant}) {
    return (<>
        <div className="col-md-3 mb-5">
            <div className="plant-card-container">
                <div className="plant-card h-100">
                    <div className="plant-img-container">
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

                    <div className="plant-card-body d-flex flex-column">
                        {/* 中文名 */}
                        <Link
                            to={`/detail/${plant.plantId}`}
                            className="plant-name-link"
                            state={{mainPlantInfo: plant}}
                        >
                            <h5 className="plant-card-title text-truncate">{plant.plantName}</h5>
                        </Link>

                        {/* 拉丁学名 */}
                        <p className="latin-name-text text-truncate">{plant.plantLatinName}</p>

                        {/* 价格按钮区 */}
                        <div className="plant-card-footer mt-auto">
                            <span className="plant-card-footer-purchase-button">¥ {plant.plantMinPrice}</span>
                            <Link
                                to={`/detail/${plant.plantId}`}
                                className="add-to-cart-btn"
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