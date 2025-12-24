import {useState, useEffect, useMemo, useRef} from 'react';
import {useAuth} from '/src/context/AuthContext';
import {CartContext} from '/src/context/CartContext'
import {debounce} from "/src/utils/debounce.jsx";
import api from "/src/utils/api.jsx";

export const CartProvider = ({children}) => {
    const {user} = useAuth();

    // 初始化购物车（从本地存储读取）
    const [cartItems, setCartItems] = useState(() => {
        if (user === null) {
            return []
        }
        try {
            const saved = localStorage.getItem(`cart_${user.id}`); // 获取该用户的购物车数据
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('读取本地购物车失败', error);
            localStorage.removeItem(`cart_${user.id}`); // 清除损坏的数据
            return [];
        }
    });

    // 保存上一次购物车状态，用于对比增量
    const prevCartItemsRef = useRef([]);

    // TODO 快速购物车（后续开发）
    const [quickCartOpen, setQuickCartOpen] = useState(false);

    // 防抖后的购物车同步到服务端函数
    const syncCartToServer = useMemo(
        () =>
            debounce(async (changeCartItems) => {
                try {
                    const response = await api.post(`/api/cart/sync-redis`, changeCartItems);
                    console.log('同步成功:', response.data);
                } catch (error) {
                    console.error('购物车同步到服务端失败', error);
                }
            }, 500),
        []
    );

    // 购物车变化时保存到本地存储
    useEffect(() => {
        if (user === null || !user?.id) return;

        // 本地存储（带用户ID前缀）
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));

        const prevCartItems = prevCartItemsRef.current;
        const currentCartItems = cartItems;

        // 新增/修改的项（当前有，或与上一次数量不一致）
        const addedOrUpdatedItems = currentCartItems.filter(currentItem => {
            const prevItem = prevCartItems.find(
                p => p.id === currentItem.id && p.size === currentItem.size
            );
            return !prevItem || prevItem.quantity !== currentItem.quantity;
        }).map(_ => ({
            id: _.id,
            size: _.size,
            quantity: _.quantity
        }));

        // 删除的项（上一次有，当前没有）
        const deletedItems = prevCartItems.filter(prevItem => {
            return !currentCartItems.find(
                c => c.id === prevItem.id && c.size === prevItem.size
            );
        }).map(_ => ({
            id: _.id,
            size: _.size
        }));

        // 增量同步到服务端
        if (addedOrUpdatedItems.length > 0 || deletedItems.length > 0) {
            syncCartToServer({
                addedOrUpdatedItems, // 新增/修改项
                deletedItems        // 删除项
            });
        }

        // 更新上一次购物车状态（当前状态变为下一次的上一次状态）
        prevCartItemsRef.current = [...currentCartItems];

        return () => syncCartToServer.cancel?.(); // 清理函数。如果组件卸载，取消挂起的防抖调用
    }, [cartItems, user, user?.id, syncCartToServer]);

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
