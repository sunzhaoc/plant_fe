import {Link} from 'react-router-dom';

export default function PlantCard({plant}) {
    return (<>
        <div className="col-md-3 mb-5">
            <div className="plant-card-container">
                {/* 竖向长方形扁平卡片 */}
                <div className="plant-card">
                    {/* 图片容器 - 竖向长方形比例 */}
                    <div className="plant-img-container">
                        <Link to={`/detail/${plant.id}`}>
                            <img
                                src={plant.images[0]}
                                className="plant-card-img"
                                alt={plant.name}
                                loading="lazy"
                            />
                        </Link>
                    </div>

                    <div className="plant-card-body">
                        {/* 中文名 */}
                        <Link to={`/detail/${plant.id}`} className="plant-name-link">
                            <h5 className="plant-card-title">{plant.name}</h5>
                        </Link>

                        {/* 拉丁学名 */}
                        <p className="latin-name-text">{plant.latinName}</p>

                        {/* 价格按钮区 */}
                        <div className="plant-card-footer">
                            <span className="plant-price">¥{plant.price}</span>
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