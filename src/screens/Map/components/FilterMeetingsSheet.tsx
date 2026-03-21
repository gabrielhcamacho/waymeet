import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMapFilterStore } from '@/src/store/useMapFilterStore';

const INTERESTS = [
    { id: '1', label: 'Esportes', icon: '⚽' },
    { id: '2', label: 'Cultural', icon: '🎭' },
    { id: '3', label: 'Gastronômico', icon: '🍽️' },
    { id: '4', label: 'Aventura', icon: '🏔️' },
    { id: '5', label: 'Musical', icon: '🎵' },
    { id: '6', label: 'Família', icon: '👨‍👩‍👧‍👦' },
    { id: '7', label: 'Business', icon: '💼' },
    { id: '8', label: 'Ecotour', icon: '🌿' },
    { id: '9', label: 'Histórico', icon: '🏛️' },
    { id: '10', label: 'Rural', icon: '🌾' },
    { id: '11', label: 'Summer', icon: '☀️' },
    { id: '12', label: 'Romance', icon: '💑' },
] as const;

interface FilterMeetingsSheetProps {
    onClose: () => void;
    translateY: Animated.Value;
}

export const FilterMeetingsSheet: React.FC<FilterMeetingsSheetProps> = ({ onClose, translateY }) => {
    const filters = useMapFilterStore((state) => state.encontros);
    const setFilters = useMapFilterStore((state) => state.setEncontrosFilters);

    const toggleInterest = (id: string) => {
        const isActive = filters.interesses.includes(id);
        if (isActive) {
            setFilters({ interesses: filters.interesses.filter(i => i !== id) });
        } else {
            setFilters({ interesses: [...filters.interesses, id] });
        }
    };

    const toggleAccess = (type: 'gratis' | 'pago') => {
        const isActive = filters.acesso.includes(type);
        if (isActive) {
            setFilters({ acesso: filters.acesso.filter(a => a !== type) });
        } else {
            setFilters({ acesso: [...filters.acesso, type] });
        }
    };

    const handleClear = () => {
        setFilters({ interesses: [], quando: null, acesso: [] });
    };

    return (
        <Animated.View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            height: '80%',
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
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff0ec', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                            <Text style={{ fontSize: 16 }}>🎯</Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>Encontros</Text>
                    </View>
                    <TouchableOpacity onPress={handleClear} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#ff5028' }}>Limpar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Interests */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>INTERESSES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {INTERESTS.map(item => {
                        const isSelected = filters.interesses.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleInterest(item.id)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    paddingVertical: 8, paddingHorizontal: 14,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? 'rgba(255, 80, 40, 0.08)' : '#fff',
                                    borderWidth: 1, borderColor: isSelected ? '#ff5028' : '#E5E7EB'
                                }}
                            >
                                <Text style={{ fontSize: 14, marginRight: 6 }}>{item.icon}</Text>
                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#ff5028' : '#4B5563' }}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Timing */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>QUANDO</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
                    {(['hoje', 'semana', 'fds'] as const).map(time => {
                        const isSelected = filters.quando === time;
                        const labels = { hoje: 'Hoje', semana: 'Esta semana', fds: 'Este fim de semana' };
                        return (
                            <TouchableOpacity
                                key={time}
                                onPress={() => setFilters({ quando: isSelected ? null : time })}
                                style={{
                                    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
                                    backgroundColor: isSelected ? '#1a1a1a' : '#f3f4f6',
                                    borderWidth: 1, borderColor: isSelected ? '#1a1a1a' : 'transparent'
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? '#fff' : '#4B5563' }}>
                                    {labels[time]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Access Type */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>TIPO DE ACESSO</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['gratis', 'pago'] as const).map(type => {
                        const isSelected = filters.acesso.includes(type);
                        const labels = { gratis: 'Grátis', pago: 'Pago' };
                        return (
                            <TouchableOpacity
                                key={type}
                                onPress={() => toggleAccess(type)}
                                style={{
                                    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
                                    backgroundColor: isSelected ? '#1a1a1a' : '#f3f4f6',
                                    borderWidth: 1, borderColor: isSelected ? '#1a1a1a' : 'transparent'
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? '#fff' : '#4B5563' }}>
                                    {labels[type]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff' }}>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: '#1a1a1a', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Aplicar filtros</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};
