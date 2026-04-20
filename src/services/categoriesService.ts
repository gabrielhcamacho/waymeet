import { supabase } from '../config/supabase';
import { Category } from '../types';
import { CATEGORIES } from '../data/mockData';

export async function fetchCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error || !data || data.length === 0) return CATEGORIES;

        return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon_name || 'help-circle-outline',
            color: c.color || '#FF7A00',
        }));
    } catch {
        return CATEGORIES;
    }
}
