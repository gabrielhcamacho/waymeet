import { create } from 'zustand';
import { Category } from '../types';
import { CATEGORIES } from '../data/mockData';
import { fetchCategories } from '../services/categoriesService';

interface CategoriesStore {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
    categories: CATEGORIES,
    isLoading: false,

    fetchCategories: async () => {
        set({ isLoading: true });
        const data = await fetchCategories();
        set({ categories: data.length > 0 ? data : CATEGORIES, isLoading: false });
    },
}));
