import QuantitySelector from '/src/components/UI/QuantitySelector';

export default function CartItem({ item, onUpdate, onRemove }) {
    const handleIncrease = () => {
        onUpdate(item.id, item.size, item.quantity + 1);
    };

    const handleDecrease = () => {
        if (item.quantity > 1) {
            onUpdate(item.id, item.size, item.quantity - 1);
        }
    };

    return (
        <div className="cart-item d-flex align-items-center">
            <div className="col-2">
                <img src={item.image} alt={item.name} className="img-fluid rounded" style={{ height: '80px', objectFit: 'cover' }} />
            </div>
            <div className="col-3">
                <h6>{item.name}</h6>
                <p className="text-muted small">{item.latinName}</p>
                <p className="text-sm">规格: {item.size}</p>
            </div>
            <div className="col-2">¥{item.price}</div>
            <div className="col-2">
                <QuantitySelector
                    quantity={item.quantity}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                />
            </div>
            <div className="col-2">¥{item.price * item.quantity}</div>
            <div className="col-1">
                <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onRemove(item.id, item.size)}
                >
                    <i className="bi bi-trash"></i>
                </button>
            </div>
        </div>
    );
}