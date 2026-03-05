import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import type {PropsWithChildren} from 'react';
import {useAuth} from 'src/context/AuthContext';
import {CartContext, type CartItem} from 'src/context/CartContext';
import {debounce} from "src/utils/debounce.tsx";
import api from "src/utils/api.tsx";
import toast from 'react-hot-toast';

type DebouncedFunction<T extends (...args: any[]) => Promise<any>> = T & {
    cancel?: () => void;
};

type CartProviderProps = PropsWithChildren<{}>;

type DeltaCartItems = {
    addedOrUpdatedItems: Pick<CartItem, 'id' | 'size' | 'quantity'>[];
    deletedItems: Pick<CartItem, 'id' | 'size'>[];
};

export const CartProvider = ({children}: CartProviderProps) => {
    const {user} = useAuth();
    const lastSyncedItemsRef = useRef<CartItem[]>([]);
    const [quickCartOpen, setQuickCartOpen] = useState(false);

    // 初始化购物车
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        if (user === null || !user?.id) {
            return [];
        }
        try {
            const saved = localStorage.getItem(`cart_${user.id}`);  // 获取该用户的购物车数据
            return saved ? (JSON.parse(saved) as CartItem[]) : [];
        } catch (error) {
            console.error('读取本地购物车失败', error);
            localStorage.removeItem(`cart_${user.id}`); // 清除损坏的数据
            return [];
        }
    });

    // 防抖后的购物车同步到服务端函数
    const syncCartToServer = useMemo(
        () => debounce(async (deltaCartItems: DeltaCartItems) => {
            try {
                await api.post(`/api/cart/sync-redis`, deltaCartItems);
            } catch (error) {
                console.error('购物车同步到服务端失败', error);
            }
        }, 500) as DebouncedFunction<(deltaCartItems: DeltaCartItems) => Promise<void>>,
        []
    );

    // 购物车变化 保存本地 + 触发增量同步
    useEffect(() => {
        if (user === null || !user?.id) return;

        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));

        const prevCartItems = lastSyncedItemsRef.current;
        const currentCartItems = cartItems;

        // 新增/修改的项
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

        // 删除的项
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
            syncCartToServer({addedOrUpdatedItems, deletedItems});
        }

        lastSyncedItemsRef.current = [...currentCartItems];

        // 3. 安全调用cancel方法（增加可选链，避免运行时错误
        return () => syncCartToServer.cancel?.();
    }, [cartItems, user, user?.id, syncCartToServer]);

    // 添加商品到购物车
    const addToCart = useCallback((plant: {
        plantId: string | number;
        plantSku: string;
        plantQuantity: number;
        stock: number;
        plantName: string;
        plantLatinName: string;
        plantPrice: number;
        plantMainImgUrl: string;
        plantSkuId: string | number;
    }) => {
        const existingItem = cartItems.find(
            _ => _.id === plant.plantId && _.size === plant.plantSku
        );
        const existingQuantity = existingItem ? existingItem.quantity : 0;
        // 校验库存
        if (existingQuantity + plant.plantQuantity > plant.stock) {
            toast.error(`库存不足！当前规格仅剩 ${plant.stock} 件，最多还可加入 ${plant.stock - existingQuantity} 件`);
            return;
        }

        setCartItems(prev => {
            const existingIndex = prev.findIndex(
                item => item.id === plant.plantId && item.size === plant.plantSku
            );
            if (existingIndex > -1) {
                const newItems = [...prev];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: existingQuantity + plant.plantQuantity
                };
                return newItems;
            }
            return [...prev, {
                id: plant.plantId,
                name: plant.plantName,
                latinName: plant.plantLatinName,
                price: plant.plantPrice,
                imgUrl: plant.plantMainImgUrl,
                skuId: plant.plantSkuId,
                size: plant.plantSku,
                quantity: plant.plantQuantity,
                stock: plant.stock,
            }];
        });
        toast.success('已添加到购物车');
    }, [cartItems]);

    // 更新商品数量（适配增/减的情况，增加库存校验）
    const updateQuantity = useCallback((id: string | number, size: string, newQuantity: number) => {
        // 查找该商品规格的库存
        const targetItem = cartItems.find(item => item.id === id && item.size === size);
        if (!targetItem) return;
        // 限制最大数量为库存
        const finalQuantity = Math.min(Math.max(1, newQuantity), targetItem.stock);
        // 如果用户输入的数量超过库存，给出提示
        if (newQuantity > targetItem.stock) {
            toast.error(`库存不足！该规格仅剩${targetItem.stock}件`);
        }

        setCartItems(prev => prev.map(item =>
            (item.id === id && item.size === size)
                ? {...item, quantity: finalQuantity}
                : item
        ));
    }, [cartItems]);

    // 删除购物车商品
    const removeFromCart = useCallback((id: string | number, size: string) => {
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
                removeFromCart,
                clearCart: () => setCartItems([]),
                totalPrice,
                totalItems,
                quickCartOpen,
                setQuickCartOpen,
                setCartItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};