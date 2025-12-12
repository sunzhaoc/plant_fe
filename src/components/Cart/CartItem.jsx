import QuantitySelector from '/src/components/UI/QuantitySelector';

export default function CartItem({item, onUpdate, onRemove}) {
    const handleIncrease = () => {
        onUpdate(item.id, item.size, item.quantity + 1);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdate(item.id, item.size, item.quantity - 1);
        }
    };

    return (
        <div
            className="cart-item d-flex align-items-center py-1" style={{
            lineHeight: 1.2,  // 收紧行高
            maxHeight: '70px', // 限制最大高度
            minHeight: '60px'  // 保证最小可点击区域
        }}>
            {/*图片*/}
            <div className="col-2 pe-1">
                <img
                    src={item.image}
                    alt={item.name}
                    className="img-fluid rounded"
                    style={{
                        height: '65px',
                        objectFit: 'cover',
                        width: '85%' // 保证图片自适应列宽
                    }}
                />
            </div>

            {/* 文字区 */}
            <div className="col-3 pe-1">
                <h6 className="mb-0 fs-7" style={{fontSize: '0.85rem'}}>
                    {item.name}
                </h6>
                <p className="text-muted small mb-0" style={{fontSize: '0.7rem'}}>
                    {item.latinName}
                </p>
                <p className="mb-0" style={{fontSize: '0.75rem'}}>
                    规格: {item.size}
                </p>
            </div>

            {/* 单价列 */}
            <div className="col-2 pe-1" style={{fontSize: '0.85rem'}}>
                ¥ {item.price}
            </div>

            {/* 数量选择器列 */}
            <div className="col-2 pe-1">
                <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    size="sm"
                />
            </div>

            {/* 总价列 */}
            <div className="col-2 pe-1" style={{fontSize: '0.85rem'}}>
                ¥ {(item.price * item.quantity).toFixed(2)}
            </div>

            {/* 删除按钮优化 */}
            <div className="col-1">
                <button
                    className="btn btn-xs btn-outline-danger p-1"
                    onClick={() => onRemove(item.id, item.size)}
                    style={{
                        padding: '2px 6px', // 精准控制按钮内边距
                        fontSize: '0.75rem'
                    }}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
}