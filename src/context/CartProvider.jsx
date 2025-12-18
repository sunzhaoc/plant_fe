import {useState, useEffect} from 'react';
import {CartContext} from '/src/context/CartContext'


export const CartProvider = ({children}) => {
    // 初始化购物车（从本地存储读取）
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cartItems');
        return saved ? JSON.parse(saved) : [];
    });

    // TODO
    // 快速购物车（后续开发）
    const [quickCartOpen, setQuickCartOpen] = useState(false);

    // 购物车变化时保存到本地存储
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // 添加商品到购物车
    const addToCart = (plant, size, quantity) => {
        const existingItem = cartItems.find(_ => _.id === plant.id && _.size === size);
        if (existingItem) {
            // 购物车存在该商品
            setCartItems(
                cartItems.map(_ =>
                    _.id === plant.id && _.size === size
                        ? {..._, quantity: _.quantity + quantity}
                        : _
                )
            );
        } else {
            // 购物车不存在该商品
            setCartItems([
                ...cartItems,
                {
                    id: plant.id,
                    name: plant.name,
                    latinName: plant.latinName,
                    price: plant.price,
                    imgUrl: plant.imgUrl[0],
                    size,
                    quantity,
                },
            ]);
        }
    };

    // 更新商品数量
    const updateQuantity = (id, size, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(
            cartItems.map(item =>
                item.id === id && item.size === size
                    ? {...item, quantity: newQuantity}
                    : item
            )
        );
    };

    // 减少商品数量
    const decreaseQuantity = (id, size) => {
        const item = cartItems.find(item => item.id === id && item.size === size);
        if (item && item.quantity > 1) {
            updateQuantity(id, size, item.quantity - 1);
        }
    };

    // 增加商品数量
    const increaseQuantity = (id, size) => {
        const item = cartItems.find(item => item.id === id && item.size === size);
        if (item) {
            updateQuantity(id, size, item.quantity + 1);
        }
    };

    // 删除购物车商品
    const removeFromCart = (id, size) => {
        setCartItems(
            cartItems.filter(item => !(item.id === id && item.size === size))
        );
    };

    // 清空购物车
    const clearCart = () => {
        setCartItems([]);
    };

    // 计算总价
    const getTotalPrice = () => {
        const totalInCents = cartItems.reduce(
            (total, item) => {
                const itemTotal = Math.round((item.price * item.quantity) * 100);
                return total + itemTotal;
            }, 0
        );
        return (totalInCents / 100).toFixed(2);
    };

    // 计算商品总数
    const getTotalItems = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                decreaseQuantity,
                increaseQuantity,
                removeFromCart,
                clearCart,
                getTotalPrice,
                getTotalItems,
                quickCartOpen,
                setQuickCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
