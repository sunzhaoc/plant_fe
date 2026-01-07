import OrderList from '/src/components/Order/OrderList';

export default function OrderPage() {
    return (
        <div className="container content">
            <h2 className="mb-4 fw-bold">我的订单</h2>
            <OrderList />
        </div>
    );
}