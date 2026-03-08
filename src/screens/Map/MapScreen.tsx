import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Linking, ActivityIndicator, Animated, Image, ScrollView, PanResponder } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Shadows, BorderRadius } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { AvatarRow } from '../../components/AvatarRow';
import { MapLayerChips } from '../../components/MapLayerChips';
import { useEventsStore } from '../../store/useEventsStore';
import { locationService } from '../../services/locationService';
import { formatEventDateTime } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WayMeetEvent, MapLayer, Place, PresenceUser } from '../../types';
import { MOCK_PRESENCE_USERS, MOCK_HEAT_ZONES } from '../../data/mockData';
import { usePresenceStore } from '../../store/usePresenceStore';
import { foursquareService } from '../../services/foursquareService';
import Supercluster from 'supercluster';

const { width, height } = Dimensions.get('window');

// -------------------------------------------------------------
// Helper: Event Pin (Teardrop)
// -------------------------------------------------------------
const EventPin = ({ event, isSelected }: { event: WayMeetEvent, isSelected: boolean }) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    // Check if event is starting today or active (mock active logic)
    const isAgora = event.title.toLowerCase().includes('agora') || event.category === 'Sports';

    useEffect(() => {
        if (isAgora) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true })
                ])
            ).start();
        }
    }, [isAgora]);

    const getEmoji = (cat: string) => {
        if (cat === 'Sports') return '⚽';
        if (cat === 'Adventures') return '🏔️';
        if (cat === 'Cultural') return '🎭';
        if (cat === 'Gastronomic') return '🍽️';
        return '📍';
    };

    return (
        <View pointerEvents="none" style={{ alignItems: 'center', justifyContent: 'center', width: 60, height: 60 }}>
            {isAgora && (
                <Animated.View style={{
                    position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: '#ff5028',
                    opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                    transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.5] }) }]
                }} />
            )}
            <View style={{
                width: isSelected ? 42 : 36,
                height: isSelected ? 42 : 36,
                backgroundColor: '#ff5028',
                borderTopLeftRadius: 21, borderTopRightRadius: 21, borderBottomRightRadius: 21, borderBottomLeftRadius: 2,
                transform: [{ rotate: '-45deg' }],
                justifyContent: 'center', alignItems: 'center',
                shadowColor: '#ff5028', shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
                shadowOpacity: isSelected ? 0.6 : 0.3, shadowRadius: isSelected ? 8 : 4, elevation: isSelected ? 10 : 5,
                borderColor: '#ffffff',
                borderWidth: isSelected ? 2 : 1
            }}>
                <Text style={{ transform: [{ rotate: '45deg' }], fontSize: isSelected ? 20 : 16 }}>{getEmoji(event.category)}</Text>
            </View>
        </View>
    );
};

// -------------------------------------------------------------
// Helper: Place Pin (Badge Horizontal)
// -------------------------------------------------------------
const PlacePin = ({ place, isSelected }: { place: Place, isSelected: boolean }) => {
    const scaleAnim = useRef(new Animated.Value(isSelected ? 1.15 : 1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isSelected ? 1.25 : 1,
            friction: 5, tension: 80,
            useNativeDriver: true,
        }).start();
    }, [isSelected]);

    const getPlaceEmoji = (category: string) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('restaurante') || cat.includes('comida') || cat.includes('food')) return '🍽️';
        if (cat.includes('bar') || cat.includes('pub') || cat.includes('bebida')) return '🍸';
        if (cat.includes('parque') || cat.includes('praça')) return '🌳';
        if (cat.includes('museu') || cat.includes('arte')) return '🏛️';
        if (cat.includes('mirante') || cat.includes('vista')) return '🏔️';
        if (cat.includes('café') || cat.includes('coffee')) return '☕';
        if (cat.includes('clube') || cat.includes('festa') || cat.includes('balada')) return '🎉';
        return '📍';
    };

    const emoji = place.categoryIcons?.[0] || getPlaceEmoji(place.category);

    return (
        <View pointerEvents="none" style={{ alignItems: 'center', justifyContent: 'center' }}>
            {isSelected && (
                <Animated.View style={{
                    position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: '#28c878',
                    opacity: 0.25, transform: [{ scale: scaleAnim.interpolate({ inputRange: [1, 1.25], outputRange: [1, 1.6] }) }]
                }} />
            )}
            <Animated.View style={{
                flexDirection: 'row', backgroundColor: '#28c878', paddingVertical: 6, paddingHorizontal: 10,
                borderRadius: 20, alignItems: 'center',
                transform: [{ scale: scaleAnim }],
                shadowColor: '#28c878', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSelected ? 0.6 : 0.2, shadowRadius: isSelected ? 8 : 3, elevation: isSelected ? 10 : 3,
                borderColor: '#ffffff', borderWidth: isSelected ? 2 : 1
            }}>
                <Text style={{ fontSize: 13 }}>{emoji}</Text>
                {isSelected && (
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 6 }}>
                        {place.name.split(' ')[0]}
                    </Text>
                )}
            </Animated.View>
        </View>
    );
};

// -------------------------------------------------------------
// Helper: Person Pin (Avatar + Halo)
// -------------------------------------------------------------
const PersonPin = ({ person, isSelected }: { person: PresenceUser, isSelected: boolean }) => {
    return (
        <View pointerEvents="none" style={{ alignItems: 'center', justifyContent: 'center', width: 60, height: 60 }}>
            <View style={{
                position: 'absolute', width: isSelected ? 56 : 46, height: isSelected ? 56 : 46,
                borderRadius: 28, backgroundColor: 'rgba(70, 130, 255, 0.25)'
            }} />
            <View style={{
                backgroundColor: '#fff', borderRadius: 20, padding: 2,
                shadowColor: '#4682ff', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSelected ? 0.6 : 0.3, shadowRadius: isSelected ? 6 : 3, elevation: 5,
            }}>
                {person.avatarUrl ? (
                    <Image source={{ uri: person.avatarUrl }} style={{
                        width: isSelected ? 36 : 28, height: isSelected ? 36 : 28,
                        borderRadius: 18, borderWidth: 2, borderColor: '#4682ff'
                    }} />
                ) : (
                    <View style={{
                        width: isSelected ? 36 : 28, height: isSelected ? 36 : 28,
                        borderRadius: 18, borderWidth: 2, borderColor: '#4682ff',
                        backgroundColor: '#4682ff', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: 14 }}>{person.intentionEmoji || '👤'}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// -------------------------------------------------------------
// Helper: Cluster Pin
// -------------------------------------------------------------
const ClusterPin = ({ count }: { count: number }) => (
    <View style={{
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#ff5028',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#ff5028', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 6,
        borderWidth: 2, borderColor: '#fff'
    }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{count}</Text>
    </View>
);

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { events } = useEventsStore();
    const mapRef = useRef<MapView>(null);
    const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['eventos', 'pessoas']);
    const [foursquarePlaces, setFoursquarePlaces] = useState<Place[]>([]);
    const { activeUsers, setActiveUsers } = usePresenceStore();

    const [userLocation, setUserLocation] = useState({ latitude: -26.9926, longitude: -48.6340 });
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

    // Selected Item Logic
    const [selectedItem, setSelectedItem] = useState<{ type: 'event' | 'place' | 'person', data: any } | null>(null);

    // Panel Animation
    const panelAnim = useRef(new Animated.Value(0)).current;

    // Minimization State & Animation
    const [isMinimized, setIsMinimized] = useState(false);
    const minimizeAnim = useRef(new Animated.Value(0)).current;

    const minAnimValue = useRef(0);
    useEffect(() => {
        const listener = minimizeAnim.addListener(({ value }) => { minAnimValue.current = value; });
        return () => minimizeAnim.removeListener(listener);
    }, []);

    const selectedItemRef = useRef<{ type: 'event' | 'place' | 'person', data: any } | null>(null);
    useEffect(() => {
        selectedItemRef.current = selectedItem;
    }, [selectedItem]);

    // Prevent MapView onPress from immediately dismissing marker click
    const lastMarkerPress = useRef(0);

    useEffect(() => {
        Animated.spring(minimizeAnim, {
            toValue: isMinimized ? 1 : 0,
            useNativeDriver: true,
            friction: 9, tension: 55
        }).start();
    }, [isMinimized]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
            onPanResponderGrant: () => {
                minimizeAnim.stopAnimation();
                minimizeAnim.setOffset(minAnimValue.current);
                minimizeAnim.setValue(0);
            },
            onPanResponderMove: (_, gestureState) => {
                const maxDist = selectedItemRef.current ? 230 + insets.bottom : 140 + insets.bottom;
                minimizeAnim.setValue(gestureState.dy / maxDist);
            },
            onPanResponderTerminationRequest: () => false,
            onPanResponderRelease: (_, gestureState) => {
                minimizeAnim.flattenOffset();
                const pos = minAnimValue.current;
                let target = isMinimized;

                if (gestureState.vy > 0.5 || pos > 0.45) target = true;
                else if (gestureState.vy < -0.5 || pos < 0.55) target = false;

                setIsMinimized(target);

                Animated.spring(minimizeAnim, {
                    toValue: target ? 1 : 0,
                    useNativeDriver: true,
                    friction: 9, tension: 55
                }).start();
            }
        })
    ).current;

    const toggleLayer = (layer: MapLayer) => {
        setActiveLayers(prev => prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]);
        setSelectedItem(null);
        setIsMinimized(false);
    };

    useEffect(() => {
        (async () => {
            const permission = await locationService.requestPermission();
            setHasLocationPermission(permission);
            if (permission) {
                const loc = await locationService.getCurrentLocation();
                if (loc) setUserLocation({ latitude: loc.latitude, longitude: loc.longitude });
            }
        })();
        setActiveUsers(MOCK_PRESENCE_USERS);
    }, []);

    useEffect(() => {
        if (activeLayers.includes('lugares')) {
            foursquareService.getPlacesNearby(userLocation.latitude, userLocation.longitude)
                .then(places => setFoursquarePlaces(places))
                .catch(err => console.error(err));
        }
    }, [activeLayers, userLocation]);

    // Clustering logic via supercluster for events (only if active)
    const [clusters, setClusters] = useState<any[]>([]);
    const [region, setRegion] = useState({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const supercluster = useMemo(() => {
        const sc = new Supercluster({ radius: 40, maxZoom: 16 });
        const points = activeLayers.includes('eventos') ? events.map(e => ({
            type: 'Feature',
            properties: { cluster: false, eventId: e.id, event: e },
            geometry: { type: 'Point', coordinates: [e.longitude, e.latitude] }
        })) : [];
        sc.load(points as any);
        return sc;
    }, [events, activeLayers]);

    useEffect(() => {
        if (supercluster && region) {
            const bbox = [
                region.longitude - region.longitudeDelta / 2,
                region.latitude - region.latitudeDelta / 2,
                region.longitude + region.longitudeDelta / 2,
                region.latitude + region.latitudeDelta / 2,
            ];
            const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
            const cl = supercluster.getClusters(bbox as any, zoom);
            setClusters(cl);
        }
    }, [supercluster, region]);

    // Animate panel when selection changes
    useEffect(() => {
        Animated.spring(panelAnim, {
            toValue: selectedItem ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 60
        }).start();
    }, [selectedItem]);

    const handleSelect = (type: 'event' | 'place' | 'person', data: any, lat: number, lng: number) => {
        lastMarkerPress.current = Date.now();
        setSelectedItem({ type, data });
        setIsMinimized(false);
        mapRef.current?.animateToRegion({
            latitude: lat - (region.latitudeDelta * 0.25), // offset slightly below center (25% of current screen real estate) to fit panel
            longitude: lng,
            latitudeDelta: Math.min(region.latitudeDelta, 0.02), // Preserve zoom if close, or zoom in if far
            longitudeDelta: Math.min(region.longitudeDelta, 0.02),
        }, 500);
    };

    if (hasLocationPermission === null) {
        return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }
    if (hasLocationPermission === false) {
        return (
            <View style={[styles.container, styles.centered, { padding: 24, backgroundColor: Colors.background }]}>
                <Ionicons name="location-outline" size={80} color={Colors.textMuted} style={{ marginBottom: 16 }} />
                <Text style={styles.errorTitle}>Localização Necessária</Text>
                <Text style={styles.errorDesc}>O WayMeet precisa saber onde você está para mostrar rolês e lugares incríveis ao seu redor. Libere o acesso nas configurações do aparelho.</Text>
                <TouchableOpacity style={styles.btnSettings} onPress={() => Linking.openSettings()}>
                    <Text style={styles.btnSettingsTxt}>Abrir Configurações</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Counts for MapLayerChips
    const counts = {
        eventos: events.length,
        lugares: foursquarePlaces.length,
        pessoas: activeUsers.length,
        rotas: 0
    };

    return (
        <View style={styles.container}>
            {/* Map styling using dark mode from JSON is typically passed via customMapStyle, we use standard style with darker mode if we had the JSON, but fallback is ok */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={region}
                onRegionChangeComplete={(r) => setRegion(r)}
                showsUserLocation
                showsMyLocationButton={false}
                onPress={() => {
                    if (Date.now() - lastMarkerPress.current < 500) return;
                    setSelectedItem(null);
                    setIsMinimized(false);
                }} // deselect on map click
            >
                {/* Heatmap Layer for Events/Persons -> mapped as fuzzy circles for performance */}
                {(activeLayers.includes('eventos') || activeLayers.includes('pessoas')) && MOCK_HEAT_ZONES.map(zone => (
                    <Circle
                        key={`heat-${zone.id}`}
                        center={{ latitude: zone.latitude, longitude: zone.longitude }}
                        radius={800 * zone.intensity}
                        fillColor={`rgba(${activeLayers.includes('eventos') ? '255, 80, 40' : '70, 130, 255'}, ${0.15 * zone.intensity})`}
                        strokeWidth={0}
                        strokeColor="transparent"
                    />
                ))}

                {/* Event Clusters & Markers */}
                {activeLayers.includes('eventos') && [...clusters].sort((a, b) => {
                    const aSel = !a.properties.cluster && selectedItem?.data.id === a.properties.eventId ? 1 : 0;
                    const bSel = !b.properties.cluster && selectedItem?.data.id === b.properties.eventId ? 1 : 0;
                    return aSel - bSel;
                }).map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const isCluster = cluster.properties.cluster;
                    if (isCluster) {
                        return (
                            <Marker key={`cluster-${cluster.id}`} coordinate={{ latitude, longitude }}
                                onPress={() => {
                                    const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
                                    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: region.latitudeDelta / 2, longitudeDelta: region.longitudeDelta / 2 });
                                }}>
                                <ClusterPin count={cluster.properties.point_count} />
                            </Marker>
                        );
                    }
                    const event = cluster.properties.event;
                    return (
                        <Marker key={`event-${event.id}`} coordinate={{ latitude, longitude }}
                            onPress={() => handleSelect('event', event, latitude, longitude)}
                        >
                            <EventPin event={event} isSelected={selectedItem?.data.id === event.id} />
                        </Marker>
                    );
                })}

                {/* Place Markers */}
                {activeLayers.includes('lugares') && [...foursquarePlaces].sort((a, b) => {
                    return (selectedItem?.data.id === a.id ? 1 : 0) - (selectedItem?.data.id === b.id ? 1 : 0);
                }).map((place) => (
                    <Marker key={`place-${place.id}`} coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                        onPress={() => handleSelect('place', place, place.latitude, place.longitude)}
                    >
                        <PlacePin place={place} isSelected={selectedItem?.data.id === place.id} />
                    </Marker>
                ))}

                {/* Person Markers */}
                {activeLayers.includes('pessoas') && [...activeUsers].sort((a, b) => {
                    return (selectedItem?.data.id === a.id ? 1 : 0) - (selectedItem?.data.id === b.id ? 1 : 0);
                }).map((person) => {
                    const ago = Date.now() - new Date(person.lastActive).getTime();
                    if (ago > 10 * 60 * 1000) return null; // Only active < 10m
                    return (
                        <Marker key={`person-${person.id}`} coordinate={{ latitude: person.latitude, longitude: person.longitude }}
                            onPress={() => handleSelect('person', person, person.latitude, person.longitude)}
                        >
                            <PersonPin person={person} isSelected={selectedItem?.data.id === person.id} />
                        </Marker>
                    );
                })}
            </MapView>

            {/* Layer Chips */}
            <View style={[styles.layerChipsContainer, { top: insets.top + 8 }]} pointerEvents="box-none">
                <MapLayerChips activeLayers={activeLayers} onToggle={toggleLayer} counts={counts} />
            </View>

            {/* Float Action Button & Locate Button (adjust translation when panel is active) */}
            <Animated.View style={[
                styles.fabLocationContainer,
                {
                    bottom: insets.bottom + 80,
                    zIndex: 50,
                    transform: [
                        {
                            translateY: Animated.multiply(
                                panelAnim.interpolate({ inputRange: [0, 1], outputRange: [-140, -260] }),
                                minimizeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0], extrapolate: 'clamp' })
                            )
                        }
                    ]
                }
            ]} pointerEvents="box-none">
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => {
                        mapRef.current?.animateToRegion({
                            latitude: userLocation.latitude, longitude: userLocation.longitude,
                            latitudeDelta: 0.02, longitudeDelta: 0.02,
                        });
                    }}
                >
                    <Ionicons name="navigate" size={20} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabButton} onPress={() => navigation.navigate('CreateEvent')}>
                    <Ionicons name="add" size={28} color="white" />
                </TouchableOpacity>
            </Animated.View>

            {/* -------------------------------------------------------------
                Descoberta Bottom Sheet (Fallback when no marker selected)
                ------------------------------------------------------------- */}
            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        paddingBottom: insets.bottom + 16,
                        transform: [
                            { translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] }) },
                            { translateY: minimizeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 140 + insets.bottom], extrapolate: 'clamp' }) }
                        ]
                    }
                ]}
                pointerEvents={selectedItem ? 'none' : 'box-none'}>
                {/* Drag Handle Area */}
                <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingTop: 10, paddingBottom: 10, marginTop: -10 }}>
                    <TouchableOpacity onPress={() => setIsMinimized(!isMinimized)} activeOpacity={0.7} style={{ padding: 10 }}>
                        <View style={[styles.dragHandle, { marginBottom: 0 }]} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.sheetTitle}>Perto de você · {events.length} encontros</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {events.slice(0, 5).map(e => (
                        <TouchableOpacity key={e.id} style={styles.miniCard} onPress={() => handleSelect('event', e, e.latitude, e.longitude)}>
                            <View style={[styles.miniCardHeader, { backgroundColor: e.title.includes('Agora') ? '#FFEDD5' : '#F3F4F6' }]}>
                                <Text style={{ fontSize: 20 }}>⚽</Text>
                                {e.title.includes('Agora') ? (
                                    <View style={styles.badgeAgora}><Text style={styles.badgeAgoraTxt}>AGORA</Text></View>
                                ) : (
                                    <View style={styles.badgeFuture}><Text style={styles.badgeFutureTxt}>{e.time}</Text></View>
                                )}
                            </View>
                            <Text style={styles.miniCardTitle} numberOfLines={1}>{e.title}</Text>
                            <Text style={styles.miniCardSub}>400m · {e.attendees.length} pessoas</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* -------------------------------------------------------------
                Custom Callout Card (Shows when selectedItem is valid)
                ------------------------------------------------------------- */}
            <Animated.View
                pointerEvents={selectedItem ? 'box-none' : 'none'}
                style={[
                    styles.calloutCardOverlay,
                    {
                        paddingBottom: insets.bottom + 16,
                        opacity: panelAnim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0, 1] }),
                        transform: [
                            { translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) },
                            { translateY: minimizeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 230 + insets.bottom], extrapolate: 'clamp' }) }
                        ]
                    }
                ]}>
                <View style={styles.calloutCardInner}>
                    {/* Drag Handle Area */}
                    <View {...panResponder.panHandlers} style={{ width: '100%', alignItems: 'center', paddingTop: 10, paddingBottom: 10, marginTop: -10 }}>
                        <TouchableOpacity onPress={() => setIsMinimized(!isMinimized)} activeOpacity={0.7} style={{ padding: 10 }}>
                            <View style={[styles.dragHandle, { marginBottom: 0 }]} />
                        </TouchableOpacity>
                    </View>

                    {selectedItem?.type === 'event' && (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <View style={{ flex: 1, paddingRight: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <View style={{ width: 32, height: 32, backgroundColor: '#FFF0ED', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                            <Text style={{ fontSize: 16 }}>🏃</Text>
                                        </View>
                                        <View style={styles.liveBadge}><Text style={styles.liveBadgeTxt}>AO VIVO</Text></View>
                                    </View>
                                    <Text style={styles.cardTitle}>{selectedItem.data.title}</Text>
                                    <Text style={styles.cardSubTitle}>{formatEventDateTime(selectedItem.data.date, selectedItem.data.time)} · Aprox. 350m</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 24, fontWeight: '800', color: '#1F2937' }}>{selectedItem.data.attendees.length}</Text>
                                    <Text style={{ fontSize: 11, color: '#6B7280' }}>pessoas</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <AvatarRow avatars={selectedItem.data.attendees.map((a: any) => a.avatarUrl)} size={28} maxDisplay={3} />
                                    <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>Vão participar</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                    <View style={styles.quickPill}><Text style={styles.quickPillTxt}>👟 5 min</Text></View>
                                    <View style={styles.quickPill}><Text style={styles.quickPillTxt}>{selectedItem.data.price === 0 ? 'Grátis' : `R$ ${selectedItem.data.price}`}</Text></View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.btnPrimary}
                                onPress={() => navigation.navigate('EventDetail', { event: selectedItem.data })}
                            >
                                <Text style={styles.btnPrimaryTxt}>Ver Encontro</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {selectedItem?.type === 'place' && (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <View style={{ width: 32, height: 32, backgroundColor: '#E4F8EE', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                            <Text style={{ fontSize: 16 }}>{selectedItem.data.categoryIcons?.[0] || '📍'}</Text>
                                        </View>
                                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#059669', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                            {selectedItem.data.category}
                                        </Text>
                                    </View>
                                    <Text style={styles.cardTitle}>{selectedItem.data.name}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                        <Ionicons name="location" size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
                                        <Text style={[styles.cardSubTitle, { flex: 1 }]} numberOfLines={1}>{selectedItem.data.address || 'Endereço não informado'}</Text>
                                    </View>
                                </View>
                                <View style={styles.ratingBadge}>
                                    <Ionicons name="star" size={12} color="#fff" />
                                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#fff', marginLeft: 4 }}>{selectedItem.data.rating}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    {/* Mock presence for people at the location */}
                                    <AvatarRow avatars={MOCK_PRESENCE_USERS.slice(0, 3).map(u => u.avatarUrl)} size={28} maxDisplay={3} />
                                    <Text style={{ fontSize: 13, color: '#6B7280', marginLeft: 8 }}>
                                        <Text style={{ fontWeight: 'bold', color: '#1F2937' }}>{selectedItem.data.id === '1' ? 12 : 5}</Text> pessoas aqui
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                    <View style={styles.quickPill}><Text style={styles.quickPillTxt}>🚗 1.2km</Text></View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.btnPrimary, { backgroundColor: '#28c878' }]}
                                onPress={() => navigation.navigate('PlaceDetail', { place: selectedItem.data })}
                            >
                                <Text style={styles.btnPrimaryTxt}>Ver Lugar</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {selectedItem?.type === 'person' && (
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <Image source={{ uri: selectedItem.data.avatarUrl }} style={{ width: 64, height: 64, borderRadius: 32, marginBottom: 12 }} />
                            <Text style={[styles.cardTitle, { textAlign: 'center' }]}>{selectedItem.data.displayName}</Text>
                            <Text style={[styles.cardSubTitle, { textAlign: 'center', marginBottom: 20 }]}>
                                {selectedItem.data.intentionType ? `Quer ${selectedItem.data.intentionType}` : 'Perto de você'}
                            </Text>
                            <TouchableOpacity
                                style={[styles.btnPrimary, { backgroundColor: '#4682ff' }]}
                                onPress={() => {/* Future: navigate to profile */ }}
                            >
                                <Text style={styles.btnPrimaryTxt}>Ver Perfil</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centered: { justifyContent: 'center', alignItems: 'center' },
    map: { flex: 1, width: '100%', height: '100%' },
    layerChipsContainer: { position: 'absolute', left: 0, right: 0 },
    errorTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 12 },
    errorDesc: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    btnSettings: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 100 },
    btnSettingsTxt: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    // Bottom Sheet (Descoberta)
    bottomSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 10, paddingBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20
    },
    dragHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
    sheetTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 20, marginBottom: 10 },
    miniCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, width: 160, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    miniCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 12, padding: 10, marginBottom: 10 },
    badgeAgora: { backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    badgeAgoraTxt: { color: 'white', fontSize: 9, fontWeight: 'bold' },
    badgeFuture: { backgroundColor: '#f59e0b', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
    badgeFutureTxt: { color: 'white', fontSize: 9, fontWeight: 'bold' },
    miniCardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
    miniCardSub: { fontSize: 12, color: '#6B7280' },

    // FAB & Location Buttons
    fabLocationContainer: { position: 'absolute', right: 16, alignItems: 'center' },
    locationButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
    fabButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ff5028', justifyContent: 'center', alignItems: 'center', shadowColor: '#ff5028', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },

    // Floating Rich Callout Card
    calloutCardOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
    },
    calloutCardInner: {
        backgroundColor: '#ffffff',
        marginHorizontal: 12,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 24
    },
    cardTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
    cardSubTitle: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
    liveBadge: { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    liveBadgeTxt: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
    quickPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    quickPillTxt: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
    btnPrimary: { backgroundColor: '#ff5028', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
    btnPrimaryTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
    ratingBadge: { backgroundColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
});
