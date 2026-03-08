import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const STORAGE_KEY = 'nd_wishlist_v1';

interface WishlistContextType {
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
    isWishlisted: (productId: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return [];
    });
    const { user, isAuthenticated } = useAuth();
    const prevAuthRef = useRef(isAuthenticated);

    // Load wishlist from backend when user logs in, clear when logs out
    useEffect(() => {
        if (isAuthenticated && user?.email) {
            api.getUserData(user.email)
                .then(data => {
                    if (data.wishlist && data.wishlist.length > 0) {
                        setWishlist(data.wishlist);
                    }
                })
                .catch(() => { });
        } else if (!isAuthenticated && prevAuthRef.current) {
            // User just logged out — clear wishlist
            setWishlist([]);
            localStorage.removeItem(STORAGE_KEY);
        }
        prevAuthRef.current = isAuthenticated;
    }, [isAuthenticated, user?.email]);

    // Save wishlist to localStorage + backend whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
        if (isAuthenticated && user?.email) {
            api.saveWishlist(user.email, wishlist).catch(() => { });
        }
    }, [wishlist, isAuthenticated, user?.email]);

    const toggleWishlist = (productId: string) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const isWishlisted = (productId: string) => wishlist.includes(productId);

    const clearWishlist = () => setWishlist([]);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
}
