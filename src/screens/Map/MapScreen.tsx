import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, Linking, ActivityIndicator, Animated, Image, ScrollView, PanResponder, ImageBackground } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
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
import { useMapFilterStore } from '../../store/useMapFilterStore';
import Supercluster from 'supercluster';

const { width, height } = Dimensions.get('window');

MapLibreGL.setAccessToken(null);

// -------------------------------------------------------------
// Helper: Category Icon name for Ionicons
// -------------------------------------------------------------
const getCategoryIcon = (category: string): string => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('sport') || cat.includes('esporte') || cat.includes('futebol')) return 'football-outline';
    if (cat.includes('adventure') || cat.includes('aventura')) return 'trail-sign-outline';
    if (cat.includes('cultural') || cat.includes('cultura')) return 'color-palette-outline';
    if (cat.includes('gastro') || cat.includes('food') || cat.includes('comida')) return 'restaurant-outline';
    if (cat.includes('music') || cat.includes('música') || cat.includes('musica')) return 'musical-notes-outline';
    if (cat.includes('tech')) return 'laptop-outline';
    if (cat.includes('social') || cat.includes('friends') || cat.includes('amigos')) return 'people-outline';
    if (cat.includes('café') || cat.includes('cafe') || cat.includes('coffee')) return 'cafe-outline';
    if (cat.includes('nature') || cat.includes('natureza') || cat.includes('eco')) return 'leaf-outline';
    if (cat.includes('art') || cat.includes('arte')) return 'color-palette-outline';
    if (cat.includes('negócio') || cat.includes('business')) return 'briefcase-outline';
    return 'calendar-outline';
};

// -------------------------------------------------------------
// Helper: Event Pin (Teardrop) — FULLY STATIC, no isSelected
// -------------------------------------------------------------
const EventPin = React.memo(({ event, zoomAnim }: { event: WayMeetEvent, zoomAnim: Animated.Value }) => {
    const isAgora = event.title.toLowerCase().includes('agora') || event.category === 'Sports';

    const scale = zoomAnim ? zoomAnim.interpolate({
        inputRange: [9, 13, 16],
        outputRange: [0.3, 0.7, 1.1],
        extrapolate: 'clamp',
    }) : 1;

    return (
        <Animated.View pointerEvents="none" style={{ alignItems: 'center', justifyContent: 'center', width: 60, height: 60, transform: [{ scale }] }}>
            {isAgora && (
                <View style={{
                    position: 'absolute', width: 44, height: 44, borderRadius: 22,
                    backgroundColor: 'rgba(255, 80, 40, 0.25)',
                }} />
            )}
            <View style={{
                width: 36, height: 36,
                backgroundColor: '#ff5028',
                borderTopLeftRadius: 21, borderTopRightRadius: 21, borderBottomRightRadius: 21, borderBottomLeftRadius: 2,
                transform: [{ rotate: '-45deg' }],
                justifyContent: 'center', alignItems: 'center',
                shadowColor: '#ff5028', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3, shadowRadius: 4, elevation: 5,
                borderColor: '#ffffff', borderWidth: 1
            }}>
                <View style={{ transform: [{ rotate: '45deg' }] }}>
                    <Ionicons name={getCategoryIcon(event.category) as any} size={16} color="white" />
                </View>
            </View>
        </Animated.View>
    );
});

// Remove StaticMarker - we will use MapLibreGL.MarkerView directly.

// -------------------------------------------------------------
// Helper: Place Pin (Badge Horizontal) — FULLY STATIC, no isSelected
// -------------------------------------------------------------
const PlacePin = React.memo(({ place, distance, zoomAnim }: { place: Place, distance: number, zoomAnim: Animated.Value }) => {
    const getPlaceIconName = (category: string): string => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('restaurante') || cat.includes('comida') || cat.includes('food')) return 'restaurant-outline';
        if (cat.includes('bar') || cat.includes('pub') || cat.includes('bebida')) return 'beer-outline';
        if (cat.includes('parque') || cat.includes('praça')) return 'leaf-outline';
        if (cat.includes('museu') || cat.includes('arte')) return 'business-outline';
        if (cat.includes('mirante') || cat.includes('vista')) return 'image-outline';
        if (cat.includes('café') || cat.includes('coffee')) return 'cafe-outline';
        if (cat.includes('clube') || cat.includes('festa') || cat.includes('balada')) return 'musical-notes-outline';
        return 'location-outline';
    };

    const iconName = getPlaceIconName(place.category);
    const categoryName = place.category || 'Local';
    const distText = distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;

    const scale = zoomAnim.interpolate({
        inputRange: [10, 14, 17],
        outputRange: [0.2, 0.65, 1.0],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View pointerEvents="none" style={{ alignItems: 'center', transform: [{ scale }] }}>
            <View style={{
                flexDirection: 'row',
                backgroundColor: '#ffffff',
                paddingVertical: 5,
                paddingHorizontal: 9,
                borderRadius: 20,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.12,
                shadowRadius: 3,
                elevation: 3,
            }}>
                <View style={{ marginRight: 5 }}>
                    <Ionicons name={iconName as any} size={14} color="#FF7A00" />
                </View>
                <View style={{ flexDirection: 'column' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#1f2937' }} numberOfLines={1}>
                        {place.name}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: '600', color: '#6b7280' }}>
                        {categoryName} · {distText}
                    </Text>
                </View>
            </View>
            <View style={{
                width: 8,
                height: 8,
                backgroundColor: '#ffffff',
                transform: [{ rotate: '45deg' }],
                marginTop: -4,
                zIndex: -1,
            }} />
        </Animated.View>
    );
});

// -------------------------------------------------------------
// Helper: Person Pin (Avatar + Halo) — FULLY STATIC, no isSelected
// -------------------------------------------------------------
const PersonPin = React.memo(({ person, zoomAnim }: { person: PresenceUser, zoomAnim: Animated.Value }) => {
    const scale = zoomAnim.interpolate({
        inputRange: [9, 13, 16],
        outputRange: [0.3, 0.7, 1.1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View pointerEvents="none" style={{ alignItems: 'center', justifyContent: 'center', width: 60, height: 60, transform: [{ scale }] }}>
            <View style={{
                position: 'absolute', width: 46, height: 46,
                borderRadius: 23, backgroundColor: 'rgba(70, 130, 255, 0.25)'
            }} />
            <View style={{
                backgroundColor: '#fff', borderRadius: 20, padding: 2,
                shadowColor: '#4682ff', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3, shadowRadius: 3, elevation: 5,
            }}>
                {person.avatarUrl ? (
                    <Image source={{ uri: person.avatarUrl }} style={{
                        width: 28, height: 28,
                        borderRadius: 14, borderWidth: 2, borderColor: '#4682ff'
                    }} />
                ) : (
                    <View style={{
                        width: 28, height: 28,
                        borderRadius: 14, borderWidth: 2, borderColor: '#4682ff',
                        backgroundColor: '#4682ff', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <Text style={{ fontSize: 14 }}>{person.intentionEmoji || '👤'}</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
});

// -------------------------------------------------------------
// Helper: Cluster Pin
// -------------------------------------------------------------
const ClusterPin = ({ count, zoomAnim }: { count: number, zoomAnim: Animated.Value }) => {
    const scale = zoomAnim.interpolate({
        inputRange: [9, 13, 16],
        outputRange: [0.6, 0.9, 1.2],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={{
            width: 44, height: 44, borderRadius: 22, backgroundColor: '#ff5028',
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#ff5028', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 6,
            borderWidth: 2, borderColor: '#fff',
            transform: [{ scale }]
        }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{count}</Text>
        </Animated.View>
    );
};

// -------------------------------------------------------------
// Helper: Place Cluster Pin (green bubble with count)
// -------------------------------------------------------------
const PlaceClusterPin = ({ count, zoomAnim }: { count: number, zoomAnim: Animated.Value }) => {
    const scale = zoomAnim.interpolate({
        inputRange: [10, 14, 17],
        outputRange: [0.5, 0.85, 1.1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: '#28c878',
            justifyContent: 'center', alignItems: 'center',
            shadowColor: '#28c878', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 5,
            borderWidth: 2, borderColor: '#fff',
            transform: [{ scale }]
        }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{count}</Text>
        </Animated.View>
    );
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function matchPlaceCategory(tipo: string, category: string): boolean {
    const cat = category.toLowerCase();
    switch (tipo.toLowerCase()) {
        case 'cafés': return cat.includes('cafe') || cat.includes('café') || cat.includes('coffee') || cat.includes('bakery') || cat.includes('padaria');
        case 'bares': return cat.includes('bar') || cat.includes('pub') || cat.includes('boteco') || cat.includes('brewery') || cat.includes('bebida');
        case 'restaurantes': return cat.includes('restaurante') || cat.includes('food') || cat.includes('burger') || cat.includes('pizza') || cat.includes('sushi') || cat.includes('steak') || cat.includes('lanchonete') || cat.includes('comida');
        case 'cultura': return cat.includes('museu') || cat.includes('museum') || cat.includes('history') || cat.includes('teatro') || cat.includes('theater') || cat.includes('cinema');
        case 'natureza': return cat.includes('parque') || cat.includes('park') || cat.includes('praça') || cat.includes('nature') || cat.includes('beach') || cat.includes('praia') || cat.includes('mirante') || cat.includes('lago');
        case 'esporte': return cat.includes('gym') || cat.includes('academia') || cat.includes('fitness') || cat.includes('sport') || cat.includes('esporte') || cat.includes('estádio');
        case 'compras': return cat.includes('shopping') || cat.includes('mall') || cat.includes('store') || cat.includes('loja') || cat.includes('mercado');
        case 'shows': return cat.includes('show') || cat.includes('music') || cat.includes('live') || cat.includes('concert') || cat.includes('festival') || cat.includes('clube') || cat.includes('balada');
        case 'arte': return cat.includes('arte') || cat.includes('art') || cat.includes('gallery') || cat.includes('galeria');
        default: return cat.includes(tipo.toLowerCase());
    }
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export const MapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { events, fetchEvents } = useEventsStore();
    const cameraRef = useRef<React.ElementRef<typeof MapLibreGL.Camera>>(null);
    const mapRef = useRef<React.ElementRef<typeof MapLibreGL.MapView>>(null);
    const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['eventos', 'pessoas']);
    const [foursquarePlaces, setFoursquarePlaces] = useState<Place[]>([]);
    const { activeUsers, setActiveUsers } = usePresenceStore();

    const [userLocation, setUserLocation] = useState({ latitude: -26.9926, longitude: -48.6340 });
    const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
    const [loadedRegions, setLoadedRegions] = useState<Array<{ minLat: number; maxLat: number; minLng: number; maxLng: number }>>([]);
    const [showLoadRegionBtn, setShowLoadRegionBtn] = useState(false);
    const [isLoadingRegion, setIsLoadingRegion] = useState(false);
    const [currentRegion, setCurrentRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);

    // Global Filters
    const mapFilters = useMapFilterStore();

    // Derived filtered datasets
    const filteredEvents = useMemo(() => {
        if (!userLocation) return events;
        return events.filter(e => {
            if (e.latitude === undefined || e.longitude === undefined) return false;
            // Distance Filter
            const dist = getDistance(userLocation.latitude, userLocation.longitude, e.latitude, e.longitude);
            if (dist > mapFilters.distanceKm) return false;

            // Events Filters (Encontros)
            if (mapFilters.encontros.interesses.length > 0 && !mapFilters.encontros.interesses.includes(e.category.toLowerCase())) return false;

            return true;
        });
    }, [events, userLocation, mapFilters]);

    const filteredPlaces = useMemo(() => {
        if (!userLocation) return foursquarePlaces;
        return foursquarePlaces.filter(p => {
            if (p.latitude === undefined || p.longitude === undefined) return false;
            const dist = getDistance(userLocation.latitude, userLocation.longitude, p.latitude, p.longitude);
            if (dist > mapFilters.distanceKm) return false;

            // Places Filters (Lugares)
            if (mapFilters.lugares.tipos.length > 0) {
                const isTypeMatched = mapFilters.lugares.tipos.some(tipo => {
                    return p.category ? matchPlaceCategory(tipo, p.category) : false;
                });
                if (!isTypeMatched) return false;
            }
            return true;
        });
    }, [foursquarePlaces, userLocation, mapFilters]);

    const filteredUsers = useMemo(() => {
        if (!userLocation) return activeUsers;
        return activeUsers.filter(u => {
            if (u.latitude === undefined || u.longitude === undefined) return false;
            const dist = getDistance(userLocation.latitude, userLocation.longitude, u.latitude, u.longitude);
            if (dist > mapFilters.distanceKm) return false;

            // People Filters (Pessoas)
            if (mapFilters.pessoas.soComFoto && !u.avatarUrl) return false;

            return true;
        });
    }, [activeUsers, userLocation, mapFilters]);

    const filteredHeatZones = useMemo(() => {
        return MOCK_HEAT_ZONES.filter(zone => {
            // Only show heat zone if there are actual events or active people nearby in that city
            const hasEventsInCity = filteredEvents.some(e => {
                const dist = getDistance(zone.latitude, zone.longitude, e.latitude, e.longitude);
                return dist < 5; // within 5km of the heat zone center
            });
            const hasPeopleInCity = filteredUsers.some(u => {
                const dist = getDistance(zone.latitude, zone.longitude, u.latitude, u.longitude);
                return dist < 5;
            });
            return hasEventsInCity || hasPeopleInCity;
        });
    }, [filteredEvents, filteredUsers]);

    // Map Zoom tracking for Marker dynamic scaling
    const mapZoomAnim = useRef(new Animated.Value(15)).current;

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

    const isRegionLoaded = (region: { latitude: number; longitude: number }): boolean => {
        return loadedRegions.some(r =>
            region.latitude >= r.minLat &&
            region.latitude <= r.maxLat &&
            region.longitude >= r.minLng &&
            region.longitude <= r.maxLng
        );
    };

    const handleLoadRegion = useCallback(async () => {
        if (!currentRegion || isLoadingRegion) return;
        setIsLoadingRegion(true);
        setShowLoadRegionBtn(false);
        try {
            await fetchEvents();
            const delta = currentRegion.latitudeDelta ?? 0.05;
            setLoadedRegions(prev => [...prev, {
                minLat: currentRegion.latitude - delta,
                maxLat: currentRegion.latitude + delta,
                minLng: currentRegion.longitude - delta,
                maxLng: currentRegion.longitude + delta,
            }]);
        } finally {
            setIsLoadingRegion(false);
        }
    }, [currentRegion, isLoadingRegion, fetchEvents]);

    useEffect(() => {
        (async () => {
            const permission = await locationService.requestPermission();
            setHasLocationPermission(permission);
            if (permission) {
                const loc = await locationService.getCurrentLocation();
                if (loc) setUserLocation({ latitude: loc.latitude, longitude: loc.longitude });
            }
            await fetchEvents();
            // Mark the initial region as loaded
            setLoadedRegions([{ minLat: -23.5, maxLat: -23.1, minLng: -51.4, maxLng: -51.0 }]);
        })();
        setActiveUsers(MOCK_PRESENCE_USERS);
    }, []);

    useEffect(() => {
        if (activeLayers.includes('lugares')) {
            const radiusMeters = Math.round(mapFilters.distanceKm * 1000);
            foursquareService.getPlacesNearby(userLocation.latitude, userLocation.longitude, radiusMeters)
                .then(places => setFoursquarePlaces(places))
                .catch(err => console.error(err));
        }
    }, [activeLayers, userLocation, mapFilters.distanceKm]);

    // Clustering logic via supercluster for events (only if active)
    const [clusters, setClusters] = useState<any[]>([]);
    const [placeClusters, setPlaceClusters] = useState<any[]>([]);
    const [region, setRegion] = useState({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const supercluster = useMemo(() => {
        const sc = new Supercluster({ radius: 40, maxZoom: 16 });
        const points = activeLayers.includes('eventos') ? filteredEvents.map(e => ({
            type: 'Feature',
            properties: { cluster: false, eventId: e.id, event: e },
            geometry: { type: 'Point', coordinates: [e.longitude, e.latitude] }
        })) : [];
        sc.load(points as any);
        return sc;
    }, [filteredEvents, activeLayers]);

    const placeSupercluster = useMemo(() => {
        const sc = new Supercluster({ radius: 60, maxZoom: 17 });
        const points = activeLayers.includes('lugares') ? filteredPlaces.map(p => ({
            type: 'Feature',
            properties: { cluster: false, placeId: p.id, place: p },
            geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] }
        })) : [];
        sc.load(points as any);
        return sc;
    }, [filteredPlaces, activeLayers]);

    useEffect(() => {
        if (region) {
            const bbox = [
                region.longitude - region.longitudeDelta / 2,
                region.latitude - region.latitudeDelta / 2,
                region.longitude + region.longitudeDelta / 2,
                region.latitude + region.latitudeDelta / 2,
            ];
            const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
            if (supercluster) {
                setClusters(supercluster.getClusters(bbox as any, zoom));
            }
            if (placeSupercluster) {
                setPlaceClusters(placeSupercluster.getClusters(bbox as any, zoom));
            }
        }
    }, [supercluster, placeSupercluster, region]);

    // Animate panel when selection changes
    useEffect(() => {
        Animated.spring(panelAnim, {
            toValue: selectedItem ? 1 : 0,
            useNativeDriver: true,
            friction: 8,
            tension: 60
        }).start();
    }, [selectedItem]);

    const handleSelectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSelect = useCallback((type: 'event' | 'place' | 'person', data: any, _lat: number, _lng: number) => {
        // Prevent extremely rapid consecutive taps from causing a native bridge crash
        const now = Date.now();
        if (now - lastMarkerPress.current < 300) return;
        lastMarkerPress.current = now;

        if (handleSelectRef.current) clearTimeout(handleSelectRef.current);
        
        setSelectedItem({ type, data });
        setIsMinimized(false);
        // Do NOT pan or zoom the map — respect user's current view
    }, []);

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
        eventos: filteredEvents.length,
        lugares: filteredPlaces.length,
        pessoas: filteredUsers.length,
        rotas: 0
    };

    return (
        <View style={styles.container}>
            {/* Map styling using dark mode from JSON is typically passed via customMapStyle, we use standard style with darker mode if we had the JSON, but fallback is ok */}
            <MapLibreGL.MapView
                ref={mapRef}
                style={styles.map}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                logoEnabled={false}
                attributionEnabled={false}
                compassEnabled={false}
                onRegionIsChanging={(e) => {
                    mapZoomAnim.setValue(e.properties.zoomLevel);
                }}
                onRegionDidChange={(e) => {
                    const coords = e.geometry.coordinates;
                    const bounds = e.properties.visibleBounds;
                    if (coords && bounds) {
                        const [ne, sw] = bounds;
                        const latDelta = Math.abs(ne[1] - sw[1]);
                        const lngDelta = Math.abs(ne[0] - sw[0]);
                        setRegion({
                            latitude: coords[1],
                            longitude: coords[0],
                            latitudeDelta: latDelta,
                            longitudeDelta: lngDelta,
                        });
                        const newRegion = { latitude: coords[1], longitude: coords[0], latitudeDelta: latDelta, longitudeDelta: lngDelta };
                        setCurrentRegion(newRegion);
                        setShowLoadRegionBtn(!isRegionLoaded({ latitude: coords[1], longitude: coords[0] }));
                    }
                }}
                onPress={() => {
                    if (Date.now() - lastMarkerPress.current < 500) return;
                    setSelectedItem(null);
                    setIsMinimized(true);
                }}
            >
                <MapLibreGL.Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: [userLocation.longitude, userLocation.latitude],
                        zoomLevel: 13,
                    }}
                />

                <MapLibreGL.UserLocation visible={true} showsUserHeadingIndicator={true} />

                {/* Heatmap Zones - MapLibre ShapeSource (Circles) */}
                <MapLibreGL.ShapeSource id="heat-zones"
                    shape={{
                        type: 'FeatureCollection',
                        features: MOCK_HEAT_ZONES.filter(zone => getDistance(userLocation.latitude, userLocation.longitude, zone.latitude, zone.longitude) < 20).map(zone => ({
                            type: 'Feature',
                            geometry: { type: 'Point', coordinates: [zone.longitude, zone.latitude] },
                            properties: { intensity: zone.intensity, id: zone.id }
                        }))
                    }}>
                    <MapLibreGL.CircleLayer id="heat-circles" style={{
                        circleRadius: ['*', ['get', 'intensity'], 80],
                        circleColor: activeLayers.includes('eventos') ? 'rgba(255, 80, 40, 1)' : 'rgba(70, 130, 255, 1)',
                        circleOpacity: 0.15,
                        circleStrokeWidth: 0,
                    }} />
                </MapLibreGL.ShapeSource>

                {/* Event Clusters & Markers */}
                {activeLayers.includes('eventos') && clusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const isCluster = cluster.properties.cluster;
                    if (isCluster) {
                        return (
                            <MapLibreGL.MarkerView key={`cluster-${cluster.properties.cluster_id}`} coordinate={[longitude, latitude]}>
                                <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                    cameraRef.current?.setCamera({ centerCoordinate: [longitude, latitude], zoomLevel: 16, animationDuration: 400 });
                                }}>
                                    <ClusterPin count={cluster.properties.point_count} zoomAnim={mapZoomAnim} />
                                </TouchableOpacity>
                            </MapLibreGL.MarkerView>
                        );
                    }
                    const event = cluster.properties.event;
                    return (
                        <MapLibreGL.MarkerView key={`event-${event.id}`} coordinate={[longitude, latitude]}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelect('event', event, latitude, longitude)}>
                                <EventPin event={event} zoomAnim={mapZoomAnim} />
                            </TouchableOpacity>
                        </MapLibreGL.MarkerView>
                    );
                })}

                {/* Place Clusters & Markers */}
                {activeLayers.includes('lugares') && placeClusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const isCluster = cluster.properties.cluster;
                    if (isCluster) {
                        return (
                            <MapLibreGL.MarkerView key={`place-cluster-${cluster.properties.cluster_id}`} coordinate={[longitude, latitude]}>
                                <TouchableOpacity activeOpacity={0.8} onPress={() => {
                                    cameraRef.current?.setCamera({ centerCoordinate: [longitude, latitude], zoomLevel: (region ? Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2) : 13) + 3, animationDuration: 400 });
                                }}>
                                    <PlaceClusterPin count={cluster.properties.point_count} zoomAnim={mapZoomAnim} />
                                </TouchableOpacity>
                            </MapLibreGL.MarkerView>
                        );
                    }
                    const place = cluster.properties.place;
                    const distKm = getDistance(userLocation.latitude, userLocation.longitude, place.latitude, place.longitude);
                    return (
                        <MapLibreGL.MarkerView key={`place-${place.id}`} coordinate={[longitude, latitude]}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelect('place', place, latitude, longitude)}>
                                <PlacePin place={place} distance={distKm} zoomAnim={mapZoomAnim} />
                            </TouchableOpacity>
                        </MapLibreGL.MarkerView>
                    );
                })}

                {/* Person Markers */}
                {activeLayers.includes('pessoas') && filteredUsers
                    .filter((person) => Date.now() - new Date(person.lastActive).getTime() <= 10 * 60 * 1000)
                    .map((person) => (
                        <MapLibreGL.MarkerView key={`person-${person.id}`} coordinate={[person.longitude, person.latitude]}>
                            <TouchableOpacity activeOpacity={0.8} onPress={() => handleSelect('person', person, person.latitude, person.longitude)}>
                                <PersonPin person={person} zoomAnim={mapZoomAnim} />
                            </TouchableOpacity>
                        </MapLibreGL.MarkerView>
                    ))}

            </MapLibreGL.MapView>

            {/* Layer Chips */}
            <View style={[styles.layerChipsContainer, { top: insets.top + 8 }]} pointerEvents="box-none">
                <MapLayerChips
                    activeLayers={activeLayers}
                    onToggle={toggleLayer}
                    counts={counts}
                    onOpenFilters={() => navigation.navigate('MapFilter')}
                />
            </View>

            {/* Load Region Button */}
            {(showLoadRegionBtn || isLoadingRegion) && (
                <View style={{
                    position: 'absolute',
                    top: insets.top + 106,
                    alignSelf: 'center',
                    left: 0, right: 0,
                    alignItems: 'center',
                    zIndex: 20,
                }}>
                    <TouchableOpacity
                        onPress={handleLoadRegion}
                        disabled={isLoadingRegion}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#1F2937',
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                            borderRadius: 20,
                            gap: 6,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 6,
                            elevation: 6,
                        }}
                    >
                        {isLoadingRegion ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="refresh-outline" size={16} color="white" />
                        )}
                        <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                            {isLoadingRegion ? 'Carregando...' : 'Carregar dados aqui'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

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
                        cameraRef.current?.setCamera({
                            centerCoordinate: [userLocation.longitude, userLocation.latitude],
                            zoomLevel: 15,
                            animationDuration: 500
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
                <Text style={styles.sheetTitle}>Perto de você · {filteredEvents.length} encontros</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                    {filteredEvents.slice(0, 5).map(e => (
                        <TouchableOpacity key={e.id} style={styles.miniCard} onPress={() => handleSelect('event', e, e.latitude, e.longitude)}>
                            <ImageBackground
                                source={{ uri: e.imageUrl }}
                                style={[styles.miniCardHeader, { overflow: 'hidden' }]}
                                imageStyle={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                            >
                                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', backgroundColor: 'rgba(0,0,0,0.25)' }} />
                                <View style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name={getCategoryIcon(e.category) as any} size={18} color="#FF5028" />
                                </View>
                                {e.title.includes('Agora') ? (
                                    <View style={styles.badgeAgora}><Text style={styles.badgeAgoraTxt}>AGORA</Text></View>
                                ) : (
                                    <View style={styles.badgeFuture}><Text style={styles.badgeFutureTxt}>{e.time.substring(0, 5)}</Text></View>
                                )}
                            </ImageBackground>
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
                                            <Ionicons name={getCategoryIcon(selectedItem.data.category) as any} size={18} color="#FF5028" />
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
