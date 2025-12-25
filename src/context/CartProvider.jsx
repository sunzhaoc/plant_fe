import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {useAuth} from '/src/context/AuthContext';
import {CartContext} from '/src/context/CartContext'
import {debounce} from "/src/utils/debounce.jsx";
import api from "/src/utils/api.jsx";

export const CartProvider = ({children}) => {
    const {user} = useAuth();
    const lastSyncedItemsRef = useRef([]); // 保存上一次购物车状态，用于对比增量
    const [quickCartOpen, setQuickCartOpen] = useState(false); // TODO 快速购物车（后续开发）

    // 初始化购物车（从本地存储读取）
    const [cartItems, setCartItems] = useState(() => {
        if (user === null || !user?.id) {
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

    // 防抖后的购物车同步到服务端函数
    const syncCartToServer = useMemo(
        () => debounce(async (deltaCartItems) => {
            try {
                await api.post(`/api/cart/sync-redis`, deltaCartItems);
            } catch (error) {
                console.error('购物车同步到服务端失败', error);
            }
        }, 500),
        []
    );

    // 购物车变化 保存本地 + 触发增量同步
    useEffect(() => {
        if (user === null || !user?.id) return;

        // 本地存储（带用户ID前缀）
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));

        const prevCartItems = lastSyncedItemsRef.current;
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
        lastSyncedItemsRef.current = [...currentCartItems];

        return () => syncCartToServer.cancel?.(); // 清理函数。如果组件卸载，取消挂起的防抖调用
    }, [cartItems, user, user?.id, syncCartToServer]);

    // 添加商品到购物车
    const addToCart = useCallback((plant) => {
        setCartItems(prev => {
            const existingIndex = prev.findIndex(item => item.id === plant.plantId && item.size === plant.plantSku);
            if (existingIndex > -1) {
                const newItems = [...prev];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + plant.plantQuantity
                };
                return newItems;
            }
            return [...prev, {
                id: plant.plantId,
                name: plant.plantName,
                latinName: plant.plantLatinName,
                price: plant.plantPrice,
                imgUrl: plant.plantMainImgUrl,
                size: plant.plantSku,
                quantity: plant.plantQuantity,
            }];
        });
    }, []);

    // 更新商品数量（适配增/减的情况）
    const updateQuantity = useCallback((id, size, newQuantity) => { // 参数改为 newQuantity
        setCartItems(prev => prev.map(item =>
            (item.id === id && item.size === size)
                ? {...item, quantity: Math.max(1, newQuantity)} // 直接赋值
                : item
        ));
    }, []);

    // 删除购物车商品
    const removeFromCart = useCallback((id, size) => {
        setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
    }, []);


    // 计算总价
    const totalPrice = useMemo(() => {
        const totalInCents = cartItems.reduce((acc, item) => acc + Math.round(item.price * 100) * item.quantity, 0);
        return (totalInCents / 100).toFixed(2);
    }, [cartItems]);

    // 计算商品总数
    const totalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                updateQuantity,
                // decreaseQuantity,
                // increaseQuantity,
                removeFromCart,
                clearCart: () => setCartItems([]), // 清空购物车
                totalPrice,
                totalItems,
                quickCartOpen,
                setQuickCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
