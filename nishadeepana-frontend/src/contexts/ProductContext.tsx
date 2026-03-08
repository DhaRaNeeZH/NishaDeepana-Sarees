import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sarees as defaultSarees } from '../data/sarees';
import { Saree } from '../lib/types';
import { api } from '../lib/api';

const STORAGE_KEY = 'nd_products_v1';

interface ProductContextType {
    products: Saree[];
    loading: boolean;
    updateProduct: (id: string, updates: Partial<Saree>) => void;
    addProduct: (product: Saree) => void;
    deleteProduct: (id: string) => void;
    getProductById: (id: string) => Saree | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Saree[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) return JSON.parse(stored);
        } catch { /* ignore */ }
        return defaultSarees;
    });
    const [loading, setLoading] = useState(false);

    // Try to fetch from backend API; fall back to localStorage if unavailable
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.getProducts()
            .then((data) => {
                if (!cancelled && data.length > 0) {
                    // Map MongoDB _id to id for frontend compatibility
                    const mapped = data.map((p: any) => ({
                        ...p,
                        id: p._id || p.id,
                    }));
                    setProducts(mapped);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
                }
            })
            .catch(() => {
                // Backend unavailable — use localStorage (already loaded in useState)
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    // Persist to localStorage whenever products change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch { /* ignore */ }
    }, [products]);

    const updateProduct = (id: string, updates: Partial<Saree>) => {
        setProducts(prev =>
            prev.map(product =>
                product.id === id ? { ...product, ...updates } : product
            )
        );
        // Also update backend (fire and forget)
        api.updateProduct(id, updates).catch(() => { });
    };

    const addProduct = (product: Saree) => {
        setProducts(prev => [...prev, product]);
        // Also create on backend
        api.createProduct(product).catch(() => { });
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(product => product.id !== id));
        // Also delete on backend
        api.deleteProduct(id).catch(() => { });
    };

    const getProductById = (id: string) => {
        return products.find(product => product.id === id);
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                loading,
                updateProduct,
                addProduct,
                deleteProduct,
                getProductById,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within ProductProvider');
    }
    return context;
}
