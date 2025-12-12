import {Link} from 'react-router-dom';

export default function PlantCard({plant}) {
    return (
        <>
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

                        {/* 拉丁学名移到内容区，增加竖向空间 */}
                        <div className="plant-card-body">
                            <Link to={`/detail/${plant.id}`} className="plant-name-link">
                                <h5 className="plant-card-title">{plant.name}</h5>
                            </Link>
                            {/* 扁平风格拉丁学名 */}
                            <p className="latin-name-text">{plant.latinName}</p>

                            {/* 扁平价格按钮区 */}
                            <div className="plant-card-footer">
                                <span className="plant-price">¥{plant.price}</span>
                                <Link to={`/detail/${plant.id}`} className="add-to-cart-btn">
                                    <i className="bi bi-cart-plus me-1"></i> 选购
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}