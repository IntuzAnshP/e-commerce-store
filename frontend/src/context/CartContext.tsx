import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from '../services/api';

export interface CartItem {
    id?: number | string; // Use string for temp guest IDs
    product_id: number;
    quantity: number;
    product?: any;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: any, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number | string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: number | string) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const fetchAndSyncCart = async () => {
            if (isAuthenticated) {
                // Check if there is a guest cart in local storage to merge
                const guestCartStr = localStorage.getItem('guestCart');
                if (guestCartStr) {
                    try {
                        const guestCart: CartItem[] = JSON.parse(guestCartStr);
                        // Add each item to the backend cart
                        for (const item of guestCart) {
                            if (item.product && item.product.id) {
                                await addToCartAPI(item.product.id, item.quantity);
                            }
                        }
                        localStorage.removeItem('guestCart');
                    } catch (e) {
                        console.error('Error merging guest cart', e);
                    }
                }
                
                // Fetch server cart
                try {
                    const response = await getCart();
                    setCartItems(response.data?.items || []);
                } catch (error) {
                    console.error("Failed to fetch cart from server", error);
                }
            } else {
                // Load guest cart
                const guestCartStr = localStorage.getItem('guestCart');
                if (guestCartStr) {
                    setCartItems(JSON.parse(guestCartStr));
                } else {
                    setCartItems([]);
                }
            }
        };

        fetchAndSyncCart();
    }, [isAuthenticated]);

    const addToCart = async (product: any, quantity: number = 1) => {
        if (isAuthenticated) {
            await addToCartAPI(product.id, quantity);
            const response = await getCart();
            setCartItems(response.data?.items || []);
        } else {
            setCartItems((prev) => {
                const existing = prev.find(item => item.product?.id === product.id);
                let newCart;
                if (existing) {
                    newCart = prev.map(item => item.product?.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
                } else {
                    // Use a temporary id for the guest cart item
                    newCart = [...prev, { product_id: product.id, quantity, product, id: `guest_${Date.now()}` }];
                }
                localStorage.setItem('guestCart', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const updateQuantity = async (itemId: number | string, quantity: number) => {
        if (isAuthenticated && typeof itemId === 'number') {
            await updateCartItemAPI(itemId, quantity);
            const response = await getCart();
            setCartItems(response.data?.items || []);
        } else {
            setCartItems((prev) => {
                const newCart = prev.map(item => item.id === itemId ? { ...item, quantity } : item);
                localStorage.setItem('guestCart', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const removeFromCart = async (itemId: number | string) => {
        if (isAuthenticated && typeof itemId === 'number') {
            await removeCartItemAPI(itemId);
            const response = await getCart();
            setCartItems(response.data?.items || []);
        } else {
             setCartItems((prev) => {
                const newCart = prev.filter(item => item.id !== itemId);
                localStorage.setItem('guestCart', JSON.stringify(newCart));
                return newCart;
            });
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            await clearCartAPI();
            setCartItems([]);
        } else {
            localStorage.removeItem('guestCart');
            setCartItems([]);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
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
