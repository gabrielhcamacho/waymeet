import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMapFilterStore } from '@/src/store/useMapFilterStore';

const PLACE_TYPES = [
    { id: 'Cafés', icon: 'cafe-outline' },
    { id: 'Bares', icon: 'beer-outline' },
    { id: 'Restaurantes', icon: 'restaurant-outline' },
    { id: 'Cultura', icon: 'color-palette-outline' },
    { id: 'Natureza', icon: 'leaf-outline' },
    { id: 'Esporte', icon: 'football-outline' },
    { id: 'Compras', icon: 'bag-outline' },
    { id: 'Shows', icon: 'musical-notes-outline' },
    { id: 'Arte', icon: 'color-palette-outline' },
];

const VIBES = [
    { id: 'Relaxado', icon: 'happy-outline' },
    { id: 'Agitado', icon: 'flame-outline' },
    { id: 'Pra conversar', icon: 'chatbubbles-outline' },
    { id: 'Festivo', icon: 'sparkles-outline' },
    { id: 'Tranquilo', icon: 'body-outline' },
    { id: 'Work-friendly', icon: 'laptop-outline' },
    { id: 'Noturno', icon: 'moon-outline' },
    { id: 'Diurno', icon: 'sunny-outline' },
    { id: 'Romântico', icon: 'heart-outline' },
    { id: 'Família', icon: 'people-outline' },
];

interface FilterPlacesSheetProps {
    onClose: () => void;
    translateY: Animated.Value;
}

export const FilterPlacesSheet: React.FC<FilterPlacesSheetProps> = ({ onClose, translateY }) => {
    const filters = useMapFilterStore((state) => state.lugares);
    const setFilters = useMapFilterStore((state) => state.setLugaresFilters);

    const toggleType = (id: string) => {
        const isActive = filters.tipos.includes(id);
        if (isActive) {
            setFilters({ tipos: filters.tipos.filter(t => t !== id) });
        } else {
            setFilters({ tipos: [...filters.tipos, id] });
        }
    };

    const toggleVibe = (id: string) => {
        const isActive = filters.vibes.includes(id);
        if (isActive) {
            setFilters({ vibes: filters.vibes.filter(v => v !== id) });
        } else {
            setFilters({ vibes: [...filters.vibes, id] });
        }
    };

    const togglePrice = (tier: 1 | 2 | 3) => {
        const isActive = filters.faixaPreco.includes(tier);
        if (isActive) {
            setFilters({ faixaPreco: filters.faixaPreco.filter(p => p !== tier) });
        } else {
            setFilters({ faixaPreco: [...filters.faixaPreco, tier] });
        }
    };

    const handleClear = () => {
        setFilters({ tipos: [], vibes: [], faixaPreco: [] });
    };

    return (
        <Animated.View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            height: '85%',
            transform: [{ translateY }],
            shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 15
        }}>
            {/* Handle & Header */}
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16 }}>
                    <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                        <Ionicons name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f0fdf6', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                            <Ionicons name="business-outline" size={18} color="#28c878" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>Lugares</Text>
                    </View>
                    <TouchableOpacity onPress={handleClear} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#ff5028' }}>Limpar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Types */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>TIPO DE LUGAR</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {PLACE_TYPES.map(item => {
                        const isSelected = filters.tipos.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleType(item.id)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    paddingVertical: 8, paddingHorizontal: 14,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? 'rgba(40, 200, 120, 0.08)' : '#fff',
                                    borderWidth: 1, borderColor: isSelected ? '#28c878' : '#E5E7EB'
                                }}
                            >
                                <Ionicons name={item.icon as any} size={16} color={isSelected ? '#28c878' : '#6B7280'} style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#28c878' : '#4B5563' }}>
                                    {item.id}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Vibes */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>VIBE DO LUGAR</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {VIBES.map(item => {
                        const isSelected = filters.vibes.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleVibe(item.id)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    paddingVertical: 8, paddingHorizontal: 14,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? 'rgba(40, 200, 120, 0.08)' : '#fff',
                                    borderWidth: 1, borderColor: isSelected ? '#28c878' : '#E5E7EB'
                                }}
                            >
                                <Ionicons name={item.icon as any} size={16} color={isSelected ? '#28c878' : '#6B7280'} style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#28c878' : '#4B5563' }}>
                                    {item.id}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Price Tiers */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>PREÇO</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {([1, 2, 3] as const).map(tier => {
                        const isSelected = filters.faixaPreco.includes(tier);
                        const labels = { 1: '$ Barato', 2: '$$ Médio', 3: '$$$ Caro' };
                        return (
                            <TouchableOpacity
                                key={tier}
                                onPress={() => togglePrice(tier)}
                                style={{
                                    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
                                    backgroundColor: isSelected ? 'rgba(40, 200, 120, 0.08)' : '#fff',
                                    borderWidth: 1, borderColor: isSelected ? '#28c878' : '#E5E7EB'
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#28c878' : '#4B5563' }}>
                                    {labels[tier]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff' }}>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: '#28c878', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Aplicar filtros</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
