import React, { createContext, useContext, useState, useEffect } from 'react';
import { Saree, BlouseType } from '../lib/types';
import { calculateCartTotals } from '../utils/pricing';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const STORAGE_KEY = 'nd_cart_v1';

export interface CartItem {
    productId: string;
    product: Saree;
    quantity: number;
    selectedBlouse: {
        kind: BlouseType;
        price: number;
    };
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Saree, quantity: number, selectedBlouse?: { kind: BlouseType; price: number }) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    cartSummary: {
        subtotal: number;
        discount: number;
        total: number;
        totalQuantity: number;
    };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return [];
    });
    const { user, isAuthenticated } = useAuth();
    const prevAuthRef = React.useRef(isAuthenticated);

    // Load cart from backend when user logs in, clear when logs out
    useEffect(() => {
        if (isAuthenticated && user?.email) {
            api.getUserData(user.email)
                .then(data => {
                    if (data.cart && data.cart.length > 0) {
                        setItems(data.cart as CartItem[]);
                    }
                })
                .catch(() => { });
        } else if (!isAuthenticated && prevAuthRef.current) {
            // User just logged out — clear cart
            setItems([]);
            localStorage.removeItem(STORAGE_KEY);
        }
        prevAuthRef.current = isAuthenticated;
    }, [isAuthenticated, user?.email]);

    // Save cart to localStorage + backend whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch { /* ignore */ }
        // Sync to backend if logged in
        if (isAuthenticated && user?.email) {
            api.saveCart(user.email, items).catch(() => { });
        }
    }, [items, isAuthenticated, user?.email]);

    const addItem = (
        product: Saree,
        quantity: number = 1,
        selectedBlouse?: { kind: BlouseType; price: number }
    ) => {
        const blouse = selectedBlouse || {
            kind: product.blouseIncluded,
            price: 0
        };

        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.productId === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                const newItem: CartItem = {
                    productId: product.id,
                    product,
                    quantity,
                    selectedBlouse: blouse,
                };
                return [...prevItems, newItem];
            }
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        );
    };

    const removeItem = (productId: string) => {
        setItems(prevItems => prevItems.filter(item => item.productId !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const getSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    };

    const cartSummary = React.useMemo(() => {
        const cartItems = items.map(item => ({
            basePrice: item.product.price,
            quantity: item.quantity,
            blousePrice: item.selectedBlouse.price,
        }));
        const { subtotal, discount, total } = calculateCartTotals(cartItems);
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        return { subtotal, discount, total, totalQuantity };
    }, [items]);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                updateQuantity,
                removeItem,
                clearCart,
                getSubtotal,
                cartSummary,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
