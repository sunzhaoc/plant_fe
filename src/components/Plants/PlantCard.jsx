import {Link} from 'react-router-dom';

export default function PlantCard({plant}) {
    const DEFAULT_PLANT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTUwIDE0MGMwIDEwLjktOC45IDIwLTIwIDIwaC02MGMtMTEuMSAwLTIwLTkuMS0yMC0yMFY4MGMwLTExLjEgOC45LTIwIDIwLTIwaDYwYzExLjEgMCAyMCA4LjkgMjAgMjB2NjB6bTAtODBDMTUwIDQwIDEyMCAxMCA4MCAxMEg2MGMtNDAgMC03MCAzMCIgZmlsbD0iIzcwQTk1OSIvPjxwYXRoIGQ9Ik04MCA0MGMtMjcuNiAwLTUwIDIyLjQtNTAgNTB2NjBjMCAyNy42IDIyLjQgNTAgNTAgNTBoNjBjMjcuNiAwIDUwLTIyLjQgNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMTBjLTI3LjYgMC01MCAyMi40LTUwIDUwdjYwYzAgMjcuNiAyMi40IDUwIDUwIDUwaDYwYzI3LjYgMCA1MC0yMi40IDUwLTUwdjYwYzAgMjcuNi0yMi40IDUwLTUwIDUwaC02MGMtMjcuNiAwLTUwLTIyLjQtNTAtNTBWNjBjMC0yNy42LTIyLjQtNTAtNTAtNTBIMCIgZmlsbD0iIzgwYjc2NSIvPjwvc3ZnPg==';
    return (<>
        <div className="col-md-3 mb-5">
            <div className="plant-card-container">
                {/* 竖向长方形扁平卡片 */}
                <div className="plant-card">
                    {/* 图片容器 - 竖向长方形比例 */}
                    <div className="plant-img-container">
                        <Link to={`/detail/${plant.id}`}>
                            <img
                                src={plant.images?.[0] || DEFAULT_PLANT_IMAGE}
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
                            <span className="plant-card-footer-purchase-button">¥{plant.price}</span>
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