import {createContext, useContext} from 'react';

// 1. 定义购物车项类型
export interface CartItem {
    id: string | number;
    name: string;
    latinName: string;
    price: number;
    imgUrl: string;
    skuId: string | number;
    size: string;
    quantity: number;
    stock: number;
}

// 2. 定义CartContext的value类型
interface CartContextValue {
    cartItems: CartItem[];
    addToCart: (plant: {
        plantId: string | number;
        plantSku: string;
        plantQuantity: number;
        stock: number;
        plantName: string;
        plantLatinName: string;
        plantPrice: number;
        plantMainImgUrl: string;
        plantSkuId: string | number;
    }) => void;
    updateQuantity: (id: string | number, size: string, newQuantity: number) => void;
    removeFromCart: (id: string | number, size: string) => void;
    clearCart: () => void;
    totalPrice: string;
    totalItems: number;
    quickCartOpen: boolean;
    setQuickCartOpen: (open: boolean) => void;
    setCartItems: (items: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
}

// 3. 创建上下文并指定类型（默认值用null，配合useContext的校验）
export const CartContext = createContext<CartContextValue | null>(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};