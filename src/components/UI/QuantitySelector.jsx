export default function QuantitySelector({quantity, onIncrease, onDecrease}) {
    return (
        <div className="d-flex align-items-center">
            <button
                className="btn btn-outline-secondary btn-sm"
                onClick={onDecrease}
                disabled={quantity <= 1}
            >
                <i className="bi bi-dash"></i>
            </button>
            <span className="px-3">{quantity}</span>
            <button
                className="btn btn-outline-secondary btn-sm"
                onClick={onIncrease}
            >
                <i className="bi bi-plus"></i>
            </button>
        </div>
    );
}