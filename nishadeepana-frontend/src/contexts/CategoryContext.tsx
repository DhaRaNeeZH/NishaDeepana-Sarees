import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../lib/api';

export interface Category {
    _id: string;
    name: string;
    image: string;
    visible: boolean;
    order: number;
    count: number;
}

interface CategoryContextType {
    categories: Category[];
    visibleCategories: Category[];
    loading: boolean;
    refetch: () => void;
    addCategory: (cat: Partial<Category>) => Promise<Category>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(() => {
        setLoading(true);
        api.getCategories()
            .then((data: Category[]) => setCategories(data))
            .catch(() => setCategories([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const addCategory = async (cat: Partial<Category>): Promise<Category> => {
        const saved = await api.createCategory(cat) as Category;
        setCategories(prev => [...prev, saved]);
        return saved;
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        const updated = await api.updateCategory(id, updates) as Category;
        setCategories(prev => prev.map(c => c._id === id ? updated : c));
    };

    const deleteCategory = async (id: string) => {
        await api.deleteCategory(id);
        setCategories(prev => prev.filter(c => c._id !== id));
    };

    return (
        <CategoryContext.Provider value={{
            categories,
            visibleCategories: categories.filter(c => c.visible),
            loading,
            refetch: fetchCategories,
            addCategory,
            updateCategory,
            deleteCategory,
        }}>
            {children}
        </CategoryContext.Provider>
    );
}

export function useCategories() {
    const context = useContext(CategoryContext);
    if (!context) throw new Error('useCategories must be within CategoryProvider');
    return context;
}
