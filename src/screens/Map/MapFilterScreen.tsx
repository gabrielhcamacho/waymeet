import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMapFilterStore, selectTotalActiveFilters } from '@/src/store/useMapFilterStore';
import { FilterMeetingsSheet } from './components/FilterMeetingsSheet';
import { FilterPeopleSheet } from './components/FilterPeopleSheet';
import { FilterPlacesSheet } from './components/FilterPlacesSheet';

export const MapFilterScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { distanceKm, setDistance, resetFilters, encontros, pessoas, lugares } = useMapFilterStore();
    const totalActiveFilters = useMapFilterStore(selectTotalActiveFilters);

    const [localDistance, setLocalDistance] = useState(distanceKm);
    const [activeSheet, setActiveSheet] = useState<'encontros' | 'pessoas' | 'lugares' | null>(null);
    const sheetAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const openSheet = (sheet: 'encontros' | 'pessoas' | 'lugares') => {
        setActiveSheet(sheet);
        Animated.parallel([
            Animated.timing(sheetAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const closeSheet = () => {
        Animated.parallel([
            Animated.timing(sheetAnim, { toValue: Dimensions.get('window').height, duration: 250, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => setActiveSheet(null));
    };

    // Derived counts for UI badges
    const encontrosCount = encontros.interesses.length + (encontros.quando ? 1 : 0) + encontros.acesso.length;
    let pessoasCount = pessoas.interessesEmComum.length;
    if (pessoas.idadeMin !== 18) pessoasCount++;
    if (pessoas.idadeMax !== 99) pessoasCount++;
    if (!pessoas.moradores) pessoasCount++;
    if (!pessoas.turistas) pessoasCount++;
    if (pessoas.soComFoto) pessoasCount++;
    if (pessoas.soComBio) pessoasCount++;
    const lugaresCount = lugares.tipos.length + lugares.vibes.length + lugares.faixaPreco.length;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f7' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, backgroundColor: '#E5E7EB', borderRadius: 20 }}>
                    <Ionicons name="close" size={20} color="#374151" />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>Filtros do Mapa</Text>
                <TouchableOpacity onPress={resetFilters} style={{ padding: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: totalActiveFilters > 0 ? '#ff5028' : '#9CA3AF' }}>Limpar</Text>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                {/* Distance Option placeholder */}
                <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <Ionicons name="location-sharp" size={18} color="#ff5028" style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>Distância máxima</Text>
                    </View>
                    <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 32, fontWeight: '900', color: '#1F2937' }}>{localDistance.toFixed(0)} <Text style={{ fontSize: 16, fontWeight: '600', color: '#9CA3AF' }}>km</Text></Text>
                        <Slider
                            style={{ width: '100%', height: 40, marginTop: 10 }}
                            minimumValue={1}
                            maximumValue={20}
                            step={1}
                            value={localDistance}
                            onValueChange={setLocalDistance}
                            minimumTrackTintColor="#ff5028"
                            maximumTrackTintColor="#f3f4f6"
                            thumbTintColor="#ff5028"
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 4 }}>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>1km</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>10km</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>20km</Text>
                        </View>
                    </View>
                </View>

                {/* Categories Options */}
                <View style={{ backgroundColor: '#fff', borderRadius: 16 }}>
                    <FilterRowItem
                        icon="🎯"
                        title="Encontros"
                        subtitle={encontrosCount > 0 ? "Filtros aplicados" : "Esportes, Cultural, etc."}
                        count={encontrosCount}
                        badgeColor="#ff5028"
                        onPress={() => openSheet('encontros')}
                    />
                    <FilterRowItem
                        icon="👥"
                        title="Pessoas"
                        subtitle={pessoasCount > 0 ? "Filtros aplicados" : "18-35 anos · Moradores"}
                        count={pessoasCount}
                        badgeColor="#4682ff"
                        onPress={() => openSheet('pessoas')}
                    />
                    <FilterRowItem
                        icon="🏛️"
                        title="Lugares"
                        subtitle={lugaresCount > 0 ? "Filtros aplicados" : "Cafés, Bares · Vibe relaxada"}
                        count={lugaresCount}
                        badgeColor="#28c878"
                        onPress={() => openSheet('lugares')}
                        isLast
                    />
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
                <TouchableOpacity
                    onPress={() => {
                        setDistance(localDistance);
                        navigation.goBack();
                    }}
                    style={{ backgroundColor: '#1a1a1a', paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Aplicar filtros</Text>
                </TouchableOpacity>
            </View>

            {/* Backdrop and Bottom Sheets layer */}
            {activeSheet && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <TouchableWithoutFeedback onPress={closeSheet}>
                        <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', opacity: fadeAnim }} />
                    </TouchableWithoutFeedback>
                    {activeSheet === 'encontros' && <FilterMeetingsSheet onClose={closeSheet} translateY={sheetAnim} />}
                    {activeSheet === 'pessoas' && <FilterPeopleSheet onClose={closeSheet} translateY={sheetAnim} />}
                    {activeSheet === 'lugares' && <FilterPlacesSheet onClose={closeSheet} translateY={sheetAnim} />}
                </View>
            )}
        </SafeAreaView>
    );
};

const FilterRowItem = ({ icon, title, subtitle, count, badgeColor, onPress, isLast = false }: any) => (
    <TouchableOpacity
        onPress={onPress}
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: '#F3F4F6'
        }}
    >
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${badgeColor}15`, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 }}>{title}</Text>
            {subtitle ? <Text style={{ fontSize: 13, color: '#6B7280' }} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {count > 0 && (
            <View style={{ backgroundColor: badgeColor, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{count}</Text>
            </View>
        )}
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
);
