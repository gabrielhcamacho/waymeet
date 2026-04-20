import React, { useState, useEffect } from 'react';
import {
    View, StyleSheet, TouchableOpacity, ScrollView, TextInput,
    KeyboardAvoidingView, Platform, Alert, Modal,
} from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Ionicons } from '@expo/vector-icons';
import { locationService } from '../../services/locationService';

MapLibreGL.setAccessToken(null);
import { Colors, FontSize, BorderRadius, Shadows } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { CategoryChip } from '../../components/CategoryChip';
import { CATEGORIES } from '../../data/mockData';
import { useEventsStore } from '../../store/useEventsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Input, InputField } from '@/src/components/ui/input';
import { foursquareService } from '../../services/foursquareService';
import { Place } from '../../types';

export const CreateEventModal: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { createEvent } = useEventsStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [category, setCategory] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('10');
    const [locationName, setLocationName] = useState(route?.params?.initialLocation || '');
    const [latitude, setLatitude] = useState(route?.params?.initialLatitude || -23.3045);
    const [longitude, setLongitude] = useState(route?.params?.initialLongitude || -51.1696);
    const [isPublic, setIsPublic] = useState(true);

    const [locationSuggestions, setLocationSuggestions] = useState<Place[]>([]);
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [pickedCoord, setPickedCoord] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        locationService.getCurrentLocation()
            .then(loc => { if (loc) setUserLocation(loc); })
            .catch(() => {});
    }, []);

    // Call autocomplete when user types
    const handleLocationSearch = async (text: string) => {
        setLocationName(text);
        if (text.length > 2) {
            setIsSearchingLocation(true);
            const lat = userLocation?.latitude ?? latitude;
            const lng = userLocation?.longitude ?? longitude;
            const suggestions = await foursquareService.searchPlacesAutocomplete(text, lat, lng);
            setLocationSuggestions(suggestions);
            setIsSearchingLocation(false);
        } else {
            setLocationSuggestions([]);
            setIsSearchingLocation(false);
        }
    };

    const handleSelectLocation = (place: Place) => {
        setLocationName(place.name);
        setLatitude(place.latitude);
        setLongitude(place.longitude);
        setLocationSuggestions([]);
        setIsSearchingLocation(false);
    };

    const handleCreate = () => {
        if (!title.trim() || !category || !locationName.trim()) {
            Alert.alert('Atenção', 'Preencha título, categoria e local');
            return;
        }
        createEvent({
            title,
            description,
            imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            category,
            date: date.toISOString().split('T')[0],
            time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
            latitude: latitude,
            longitude: longitude,
            locationName,
            creatorId: '1',
            maxParticipants: parseInt(maxParticipants, 10) || 10,
            price: 0,
            isPublic,
        });
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.handleBar} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Criar Encontro</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {/* Title */}
                <View style={styles.field}>
                    <Text style={styles.label}>Título</Text>
                    <Input variant="outline" size="xl" style={styles.inputStyle}>
                        <InputField
                            placeholder="Ex: Futebol na praça"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.inputField}
                        />
                    </Input>
                </View>

                {/* Description */}
                <View style={styles.field}>
                    <Text style={styles.label}>Descrição</Text>
                    <Input variant="outline" size="xl" style={[styles.inputStyle, { height: 100 }]}>
                        <InputField
                            placeholder="Descreva seu encontro..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            style={[styles.inputField, { textAlignVertical: 'top', paddingTop: 12 }]}
                        />
                    </Input>
                </View>

                {/* Location */}
                <View style={[styles.field, { zIndex: 10 }]}>
                    <Text style={styles.label}>Local</Text>
                    <Input variant="outline" size="xl" style={styles.inputStyle}>
                        <Ionicons name="location-outline" size={20} color={Colors.textMuted} style={{ marginLeft: 12 }} />
                        <InputField
                            placeholder="Nome do local"
                            value={locationName}
                            onChangeText={handleLocationSearch}
                            style={styles.inputField}
                        />
                    </Input>

                    {/* Autocomplete Dropdown */}
                    {(locationSuggestions.length > 0 || isSearchingLocation) && (
                        <View style={styles.autocompleteDropdown}>
                            {locationSuggestions.map(place => (
                                <TouchableOpacity
                                    key={place.id}
                                    style={styles.autocompleteItem}
                                    onPress={() => handleSelectLocation(place)}
                                >
                                    <Ionicons name="location" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                                    <View>
                                        <Text style={styles.autocompleteTitle}>{place.name}</Text>
                                        <Text style={styles.autocompleteSubtitle}>{place.category} · {place.address}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Pick on map button */}
                    <TouchableOpacity
                        onPress={() => setShowMapPicker(true)}
                        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="map-outline" size={16} color={Colors.primary} />
                        <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: '600' }}>
                            Escolher no mapa
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Date & Time */}
                <View style={styles.field}>
                    <Text style={styles.label}>Data e Hora</Text>
                    <View style={styles.dateTimeRow}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                            <Text style={styles.dateText}>
                                {date.toLocaleDateString('pt-BR')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowTimePicker(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="time-outline" size={18} color={Colors.primary} />
                            <Text style={styles.dateText}>
                                {`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="spinner"
                            onChange={(_, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}
                    {showTimePicker && (
                        <DateTimePicker
                            value={date}
                            mode="time"
                            display="spinner"
                            onChange={(_, selectedDate) => {
                                setShowTimePicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}
                </View>

                {/* Category */}
                <View style={styles.field}>
                    <Text style={styles.label}>Categoria</Text>
                    <View style={styles.categoriesGrid}>
                        {CATEGORIES.slice(0, 8).map((cat) => (
                            <CategoryChip
                                key={cat.id}
                                label={cat.name}
                                icon={cat.icon}
                                selected={category === cat.name}
                                onPress={() => setCategory(cat.name)}
                                style={styles.chip}
                            />
                        ))}
                    </View>
                </View>

                {/* Max Participants */}
                <View style={styles.field}>
                    <Text style={styles.label}>Máximo de participantes</Text>
                    <Input variant="outline" size="xl" style={[styles.inputStyle, { width: 120 }]}>
                        <InputField
                            placeholder="10"
                            value={maxParticipants}
                            onChangeText={setMaxParticipants}
                            keyboardType="numeric"
                            style={styles.inputField}
                        />
                    </Input>
                </View>

                {/* Visibility */}
                <View style={styles.field}>
                    <Text style={styles.label}>Visibilidade</Text>
                    <View style={styles.visibilityRow}>
                        <TouchableOpacity
                            style={[styles.visibilityOption, isPublic && styles.visibilityActive]}
                            onPress={() => setIsPublic(true)}
                        >
                            <Ionicons name="globe-outline" size={18} color={isPublic ? Colors.textInverse : Colors.text} />
                            <Text style={[styles.visibilityText, isPublic && styles.visibilityTextActive]}>
                                Público
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.visibilityOption, !isPublic && styles.visibilityActive]}
                            onPress={() => setIsPublic(false)}
                        >
                            <Ionicons name="lock-closed-outline" size={18} color={!isPublic ? Colors.textInverse : Colors.text} />
                            <Text style={[styles.visibilityText, !isPublic && styles.visibilityTextActive]}>
                                Privado
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Create Button */}
                <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.85}>
                    <Text style={styles.createButtonText}>Criar Encontro</Text>
                </TouchableOpacity>
            </ScrollView>
            {/* Map Location Picker Modal */}
            <Modal visible={showMapPicker} animationType="slide" onRequestClose={() => setShowMapPicker(false)}>
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
                        backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border
                    }}>
                        <TouchableOpacity onPress={() => setShowMapPicker(false)}>
                            <Ionicons name="close" size={24} color={Colors.text} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>Escolher local no mapa</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    {/* Instructions */}
                    <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF7ED', borderBottomWidth: 1, borderBottomColor: '#FED7AA' }}>
                        <Text style={{ fontSize: 13, color: '#92400E', textAlign: 'center' }}>
                            Toque no mapa para marcar o local do encontro
                        </Text>
                    </View>
                    {/* Map */}
                    <MapLibreGL.MapView
                        style={{ flex: 1 }}
                        styleURL="https://tiles.openfreemap.org/styles/liberty"
                        onPress={(feature: any) => {
                            if (feature?.geometry?.coordinates) {
                                const [lng, lat] = feature.geometry.coordinates;
                                setPickedCoord({ latitude: lat, longitude: lng });
                            }
                        }}
                    >
                        <MapLibreGL.Camera
                            zoomLevel={14}
                            centerCoordinate={[
                                userLocation?.longitude ?? longitude,
                                userLocation?.latitude ?? latitude
                            ]}
                            animationMode="flyTo"
                            animationDuration={500}
                        />
                        {pickedCoord && (
                            <MapLibreGL.PointAnnotation
                                id="picked-location"
                                coordinate={[pickedCoord.longitude, pickedCoord.latitude]}
                            >
                                <View style={{ width: 36, height: 36, backgroundColor: '#FF5028', borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' }}>
                                    <Ionicons name="location" size={18} color="white" />
                                </View>
                            </MapLibreGL.PointAnnotation>
                        )}
                    </MapLibreGL.MapView>
                    {/* Confirm Button */}
                    {pickedCoord && (
                        <View style={{ padding: 16, backgroundColor: Colors.background }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setLatitude(pickedCoord.latitude);
                                    setLongitude(pickedCoord.longitude);
                                    setLocationName(`${pickedCoord.latitude.toFixed(5)}, ${pickedCoord.longitude.toFixed(5)}`);
                                    setPickedCoord(null);
                                    setShowMapPicker(false);
                                }}
                                style={{ backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
                            >
                                <Text style={{ color: Colors.textInverse, fontSize: 15, fontWeight: '700' }}>Confirmar local</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    handleBar: {
        width: 40, height: 4, backgroundColor: Colors.border,
        borderRadius: 2, alignSelf: 'center', marginBottom: 12,
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    headerTitle: {
        fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.text,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8,
    },
    inputStyle: {
        borderRadius: BorderRadius.lg, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background,
    },
    inputField: {
        flex: 1, fontSize: 15, color: Colors.text, paddingHorizontal: 14, paddingVertical: 12,
    },
    autocompleteDropdown: {
        position: 'absolute', top: 80, left: 0, right: 0,
        backgroundColor: Colors.background, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.border, ...Shadows.medium,
        maxHeight: 200, zIndex: 99,
        padding: 4,
    },
    autocompleteItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
        borderBottomWidth: 1, borderBottomColor: Colors.border,
    },
    autocompleteTitle: {
        fontSize: 14, fontWeight: '600', color: Colors.text,
    },
    autocompleteSubtitle: {
        fontSize: 12, color: Colors.textSecondary, marginTop: 2,
    },
    dateTimeRow: {
        flexDirection: 'row', gap: 12,
    },
    dateButton: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 14, borderRadius: BorderRadius.lg,
        borderWidth: 1.5, borderColor: Colors.border, flex: 1,
    },
    dateText: {
        fontSize: 14, color: Colors.text,
    },
    categoriesGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    },
    chip: {
        minWidth: 0,
    },
    visibilityRow: {
        flexDirection: 'row', gap: 12,
    },
    visibilityOption: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg,
        borderWidth: 1.5, borderColor: Colors.border,
    },
    visibilityActive: {
        backgroundColor: Colors.primary, borderColor: Colors.primary,
    },
    visibilityText: {
        fontSize: 14, fontWeight: '500', color: Colors.text,
    },
    visibilityTextActive: {
        color: Colors.textInverse,
    },
    createButton: {
        backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: BorderRadius.xl,
        alignItems: 'center', marginTop: 8, ...Shadows.medium,
    },
    createButtonText: {
        fontSize: FontSize.lg, fontWeight: '700', color: Colors.textInverse,
    },
});
