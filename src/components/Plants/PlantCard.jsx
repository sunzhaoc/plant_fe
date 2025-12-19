import {Link} from 'react-router-dom';
import DBCachedImage from '/src/components/UI/DBCachedImage';

export default function PlantCard({plant}) {
    return (<>
        <div className="col-md-3 mb-5">
            <div className="plant-card-container">
                <div className="plant-card h-100">
                    <div className="plant-img-container">
                        <Link to={`/detail/${plant.id}`}>
                            <DBCachedImage
                                url={plant.imgUrl[0]}
                                params="?image_process=resize,h_260" // 图片操作参数
                                alt={plant.name}
                                className="plantCardImg"
                            />
                        </Link>
                    </div>

                    <div className="plant-card-body d-flex flex-column">
                        {/* 中文名 */}
                        <Link to={`/detail/${plant.id}`} className="plant-name-link">
                            <h5 className="plant-card-title text-truncate">{plant.name}</h5>
                        </Link>

                        {/* 拉丁学名 */}
                        <p className="latin-name-text text-truncate">{plant.latinName}</p>

                        {/* 价格按钮区 */}
                        <div className="plant-card-footer mt-auto">
                            <span className="plant-card-footer-purchase-button">¥ {plant.sizes[0].price}</span>
                            <Link to={`/detail/${plant.id}`} className="add-to-cart-btn">
                                购买
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>);
}