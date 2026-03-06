import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Shadows, BorderRadius } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { AvatarRow } from '../../components/AvatarRow';
import { MapLayerChips } from '../../components/MapLayerChips';
import { ConfirmationBar } from '../../components/ConfirmationBar';
import { useEventsStore } from '../../store/useEventsStore';
import { locationService } from '../../services/locationService';
import { formatEventDateTime } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WayMeetEvent, MapLayer } from '../../types';
import { MOCK_PLACES, MOCK_PRESENCE_USERS } from '../../data/mockData';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useIntentionStore } from '../../store/useIntentionStore';

const { width, height } = Dimensions.get('window');

export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { events } = useEventsStore();
    const mapRef = useRef<MapView>(null);
    const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['eventos']);
    const { activeUsers, setActiveUsers } = usePresenceStore();
    const [userLocation, setUserLocation] = useState({
        latitude: -23.3045,
        longitude: -51.1696,
    });

    const toggleLayer = (layer: MapLayer) => {
        setActiveLayers((prev) =>
            prev.includes(layer)
                ? prev.filter((l) => l !== layer)
                : [...prev, layer]
        );
    };

    useEffect(() => {
        (async () => {
            const loc = await locationService.getCurrentLocation();
            setUserLocation({ latitude: loc.latitude, longitude: loc.longitude });
        })();
        // Initialize presence data
        setActiveUsers(MOCK_PRESENCE_USERS);
    }, []);

    const goToEvent = (event: WayMeetEvent) => {
        navigation.navigate('EventDetail', { event });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                showsMyLocationButton={false}
            >
                {/* Event Markers */}
                {activeLayers.includes('eventos') && events.map((event) => (
                    <Marker
                        key={`event-${event.id}`}
                        coordinate={{
                            latitude: event.latitude,
                            longitude: event.longitude,
                        }}
                        pinColor={Colors.primary}
                    >
                        <View style={styles.markerContainer}>
                            <View style={styles.marker}>
                                <Text style={styles.markerEmoji}>
                                    {event.category === 'Sports' ? '⚽' :
                                        event.category === 'Adventures' ? '🏔️' :
                                            event.category === 'Cultural' ? '🎭' :
                                                event.category === 'Gastronomic' ? '🍽️' : '📍'}
                                </Text>
                            </View>
                            <View style={styles.markerTail} />
                        </View>
                        <Callout onPress={() => goToEvent(event)} style={styles.callout}>
                            <View style={styles.calloutContent}>
                                <View style={styles.calloutLeft}>
                                    <Text style={styles.calloutTitle}>{event.title}</Text>
                                    <Text style={styles.calloutDate}>
                                        {formatEventDateTime(event.date, event.time)}
                                    </Text>
                                    <View style={styles.calloutActions}>
                                        <TouchableOpacity style={styles.calloutButton}>
                                            <Text style={styles.calloutButtonText}>Detalhes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.calloutRight}>
                                    <AvatarRow
                                        avatars={event.attendees.map((a) => a.avatarUrl)}
                                        size={24}
                                        maxDisplay={3}
                                    />
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}

                {/* Place Markers (green) */}
                {activeLayers.includes('lugares') && MOCK_PLACES.map((place) => (
                    <Marker
                        key={`place-${place.id}`}
                        coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.marker, { backgroundColor: '#22C55E', borderColor: '#16A34A' }]}>
                                <Text style={styles.markerEmoji}>{place.categoryIcons[0] || '📍'}</Text>
                            </View>
                            <View style={[styles.markerTail, { backgroundColor: '#22C55E' }]} />
                        </View>
                        <Callout style={styles.callout}>
                            <View style={styles.calloutContent}>
                                <View style={styles.calloutLeft}>
                                    <Text style={styles.calloutTitle}>{place.name}</Text>
                                    <Text style={styles.calloutDate}>⭐ {place.rating} · {place.category}</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}

                {/* People Markers (presence-aware: only active in last 10 min) */}
                {activeLayers.includes('pessoas') && activeUsers
                    .filter((person) => {
                        const ago = Date.now() - new Date(person.lastActive).getTime();
                        return ago < 10 * 60 * 1000; // 10 minutes
                    })
                    .map((person) => (
                        <Marker
                            key={`person-${person.id}`}
                            coordinate={{
                                latitude: person.latitude,
                                longitude: person.longitude,
                            }}
                        >
                            <View style={{
                                width: 36, height: 36, borderRadius: 18,
                                backgroundColor: person.intentionEmoji ? '#10B981' : '#3B82F6',
                                borderWidth: 3, borderColor: 'white',
                                justifyContent: 'center', alignItems: 'center',
                                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
                            }}>
                                <Text style={{ fontSize: 14 }}>{person.intentionEmoji || '👤'}</Text>
                            </View>
                            <Callout style={styles.callout}>
                                <View style={styles.calloutContent}>
                                    <View style={styles.calloutLeft}>
                                        <Text style={styles.calloutTitle}>{person.displayName}</Text>
                                        <Text style={styles.calloutDate}>
                                            {person.intentionType ? `quer ${person.intentionType}` : person.mode === 'morador' ? '🏠 morador' : '✈️ visitante'}
                                        </Text>
                                    </View>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
            </MapView>

            {/* Layer Chips */}
            <View style={[styles.layerChipsContainer, { top: insets.top + 12 }]}>
                <MapLayerChips activeLayers={activeLayers} onToggle={toggleLayer} />
            </View>

            {/* My Location Button */}
            <TouchableOpacity
                style={[styles.locationButton, { top: insets.top + 64 }]}
                onPress={() => {
                    mapRef.current?.animateToRegion({
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    });
                }}
                accessibilityLabel="Minha localização"
            >
                <Ionicons name="navigate" size={20} color={Colors.primary} />
            </TouchableOpacity>

            <FloatingActionButton
                onPress={() => navigation.navigate('CreateEvent')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    marker: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.medium,
        borderWidth: 3,
        borderColor: Colors.background,
    },
    markerEmoji: {
        fontSize: 20,
    },
    markerTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Colors.primary,
        marginTop: -2,
    },
    callout: {
        width: 260,
    },
    calloutContent: {
        flexDirection: 'row',
        padding: 4,
    },
    calloutLeft: {
        flex: 1,
    },
    calloutRight: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10,
    },
    calloutTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    calloutDate: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    calloutActions: {
        flexDirection: 'row',
        gap: 8,
    },
    calloutButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    calloutButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textInverse,
    },
    locationButton: {
        position: 'absolute',
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.medium,
    },
    layerChipsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
});
