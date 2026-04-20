import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMapFilterStore } from '@/src/store/useMapFilterStore';

const MY_INTERESTS = [
    { id: '1', label: 'Esportes', icon: 'football-outline' },
    { id: '4', label: 'Aventura', icon: 'trail-sign-outline' },
    { id: '9', label: 'Histórico', icon: 'business-outline' }
] as const;

interface FilterPeopleSheetProps {
    onClose: () => void;
    translateY: Animated.Value;
}

export const FilterPeopleSheet: React.FC<FilterPeopleSheetProps> = ({ onClose, translateY }) => {
    const filters = useMapFilterStore((state) => state.pessoas);
    const setFilters = useMapFilterStore((state) => state.setPessoasFilters);

    const toggleCommonInterest = (id: string) => {
        const isActive = filters.interessesEmComum.includes(id);
        if (isActive) {
            setFilters({ interessesEmComum: filters.interessesEmComum.filter(i => i !== id) });
        } else {
            setFilters({ interessesEmComum: [...filters.interessesEmComum, id] });
        }
    };

    const handleClear = () => {
        setFilters({
            idadeMin: 18,
            idadeMax: 99,
            moradores: true,
            turistas: true,
            soComFoto: false,
            soComBio: false,
            interessesEmComum: [],
        });
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
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#f0f7ff', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                            <Ionicons name="people-outline" size={18} color="#4682ff" />
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>Pessoas</Text>
                    </View>
                    <TouchableOpacity onPress={handleClear} style={{ padding: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#ff5028' }}>Limpar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
                {/* Age Range */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>FAIXA ETÁRIA</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#f3f4f6', paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#1a1a1a' }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 4 }}>MÍNIMA</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setFilters({ idadeMin: Math.max(18, filters.idadeMin - 1) })} style={{ padding: 4 }}>
                                <Ionicons name="remove" size={20} color="#4B5563" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937', marginHorizontal: 12 }}>{filters.idadeMin}</Text>
                            <TouchableOpacity onPress={() => setFilters({ idadeMin: Math.min(filters.idadeMax - 1, filters.idadeMin + 1) })} style={{ padding: 4 }}>
                                <Ionicons name="add" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ width: 16, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 8 }} />
                    <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#f3f4f6', paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: '#1a1a1a' }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', marginBottom: 4 }}>MÁXIMA</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => setFilters({ idadeMax: Math.max(filters.idadeMin + 1, filters.idadeMax - 1) })} style={{ padding: 4 }}>
                                <Ionicons name="remove" size={20} color="#4B5563" />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937', marginHorizontal: 12 }}>{filters.idadeMax}</Text>
                            <TouchableOpacity onPress={() => setFilters({ idadeMax: Math.min(99, filters.idadeMax + 1) })} style={{ padding: 4 }}>
                                <Ionicons name="add" size={20} color="#4B5563" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Profile Settings */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12 }}>PERFIL</Text>

                <ProfileToggle
                    title="Moradores"
                    description="Pessoas que vivem na cidade"
                    value={filters.moradores}
                    onValueChange={(val) => setFilters({ moradores: val })}
                />
                <ProfileToggle
                    title="Turistas"
                    description="Pessoas visitando a cidade"
                    value={filters.turistas}
                    onValueChange={(val) => setFilters({ turistas: val })}
                />
                <ProfileToggle
                    title="Só com foto"
                    description="Perfis com foto de perfil"
                    value={filters.soComFoto}
                    onValueChange={(val) => setFilters({ soComFoto: val })}
                />
                <ProfileToggle
                    title="Só com bio"
                    description="Perfis com biografia preenchida"
                    value={filters.soComBio}
                    onValueChange={(val) => setFilters({ soComBio: val })}
                    isLast
                />

                {/* Common Interests */}
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1, marginTop: 32, marginBottom: 12 }}>SEUS INTERESSES EM COMUM</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {MY_INTERESTS.map(item => {
                        const isSelected = filters.interessesEmComum.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleCommonInterest(item.id)}
                                style={{
                                    flexDirection: 'row', alignItems: 'center',
                                    paddingVertical: 8, paddingHorizontal: 14,
                                    borderRadius: 100,
                                    backgroundColor: isSelected ? 'rgba(70, 130, 255, 0.08)' : '#fff',
                                    borderWidth: 1, borderColor: isSelected ? '#4682ff' : '#E5E7EB'
                                }}
                            >
                                <Ionicons name={item.icon as any} size={16} color={isSelected ? '#4682ff' : '#6B7280'} style={{ marginRight: 6 }} />
                                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '600', color: isSelected ? '#4682ff' : '#4B5563' }}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </ScrollView>

            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff' }}>
                <TouchableOpacity onPress={onClose} style={{ backgroundColor: '#4682ff', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Aplicar filtros</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const ProfileToggle = ({ title, description, value, onValueChange, isLast = false }: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#F3F4F6' }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 }}>{title}</Text>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e0e0e0', true: '#1F2937' }}
            thumbColor={'#ffffff'}
            ios_backgroundColor="#e0e0e0"
        />
    </View>
);
