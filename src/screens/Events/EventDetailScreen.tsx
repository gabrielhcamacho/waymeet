import React from 'react';
import {
    View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Shadows, BorderRadius } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { AvatarRow } from '../../components/AvatarRow';
import { ConfirmationBar } from '../../components/ConfirmationBar';
import { useEventsStore } from '../../store/useEventsStore';
import { useUserStore } from '../../store/useUserStore';
import { useChatStore } from '../../store/useChatStore';
import { formatEventDateTime, formatPrice } from '../../utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const EventDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { event } = route.params;
    const { markInterested, markConfirmed, markArrived, resetEventStatus, userEventStatus, events } = useEventsStore();
    const { user } = useUserStore();
    const { addSystemMessage } = useChatStore();

    const currentStatus = userEventStatus[event.id] || 'none';
    // Get live event data from store (counters update)
    const liveEvent = events.find((e) => e.id === event.id) || event;

    const handleConfirmationAction = () => {
        switch (currentStatus) {
            case 'none':
                markInterested(event.id);
                break;
            case 'interested':
                markConfirmed(event.id);
                addSystemMessage(event.id, `${user?.displayName} confirmou presença`);
                break;
            case 'confirmed':
                markArrived(event.id);
                addSystemMessage(event.id, `${user?.displayName} chegou no local`);
                break;
            default:
                break;
        }
    };

    const handleCancel = () => {
        resetEventStatus(event.id);
        if (currentStatus === 'confirmed' || currentStatus === 'arrived') {
            addSystemMessage(event.id, `${user?.displayName} saiu do encontro`);
        }
    };

    const getButtonConfig = () => {
        switch (currentStatus) {
            case 'none':
                return { label: 'Tenho interesse', icon: 'heart-outline' as const, bgClass: 'bg-gray-900' };
            case 'interested':
                return { label: 'Confirmar presença', icon: 'checkmark-circle-outline' as const, bgClass: 'bg-green-600' };
            case 'confirmed':
                return { label: 'Já cheguei!', icon: 'location' as const, bgClass: 'bg-orange-500' };
            case 'arrived':
                return { label: 'Você está no local ✓', icon: 'checkmark-done' as const, bgClass: 'bg-gray-400' };
        }
    };

    const btn = getButtonConfig();

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <ImageBackground
                    source={{ uri: event.imageUrl }}
                    style={styles.heroImage}
                    imageStyle={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
                >
                    <View style={[styles.heroOverlay, { paddingTop: insets.top }]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Ionicons name="arrow-back" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <View style={styles.content}>
                    {/* Category badge */}
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{event.category}</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{event.title}</Text>

                    {/* Date/Time & Location */}
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                        <Text style={styles.infoText}>
                            {formatEventDateTime(event.date, event.time)}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color={Colors.primary} />
                        <Text style={styles.infoText}>{event.locationName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
                        <Text style={styles.infoText}>{formatPrice(event.price)}</Text>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sobre o encontro</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    {/* Creator */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Organizador</Text>
                        <View style={styles.creatorRow}>
                            <ImageBackground
                                source={{ uri: event.creator.avatarUrl }}
                                style={styles.creatorAvatar}
                                imageStyle={{ borderRadius: 20 }}
                            />
                            <View>
                                <Text style={styles.creatorName}>{event.creator.displayName}</Text>
                                <Text style={styles.creatorCity}>{event.creator.homeCity}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Attendees */}
                    <View style={styles.section}>
                        <View style={styles.attendeesHeader}>
                            <Text style={styles.sectionTitle}>
                                Participantes ({event.attendees.length}/{event.maxParticipants})
                            </Text>
                        </View>
                        <View style={{ marginBottom: 16 }}>
                            <ConfirmationBar
                                interested={liveEvent.interestedCount || event.attendees.length}
                                confirmed={liveEvent.confirmedCount || event.attendees.length}
                                arrived={liveEvent.arrivedCount || 0}
                            />
                        </View>
                        <View style={styles.attendeesList}>
                            {liveEvent.attendees.map((attendee: any, index: number) => (
                                <View key={index} style={styles.attendeeItem}>
                                    <ImageBackground
                                        source={{ uri: attendee.avatarUrl }}
                                        style={styles.attendeeAvatar}
                                        imageStyle={{ borderRadius: 18 }}
                                    />
                                    <Text style={styles.attendeeName}>{attendee.displayName}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Confirmation Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
                {currentStatus !== 'none' && (
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="close-outline" size={22} color="#EF4444" />
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleConfirmationAction}
                    disabled={currentStatus === 'arrived'}
                    activeOpacity={0.85}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-4 rounded-2xl ${btn.bgClass}`}
                    style={currentStatus !== 'arrived' ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 6,
                    } : undefined}
                >
                    <Ionicons name={btn.icon} size={20} color="white" />
                    <Text className="text-base font-bold text-white">{btn.label}</Text>
                </TouchableOpacity>

                {currentStatus !== 'none' && (
                    <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => navigation.navigate('Chat', { eventId: event.id, eventTitle: event.title })}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    heroImage: { width: '100%', height: 280 },
    heroOverlay: {
        flex: 1, justifyContent: 'flex-start', padding: 16,
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center', alignItems: 'center',
    },
    content: { paddingHorizontal: 20, paddingTop: 20 },
    categoryBadge: {
        alignSelf: 'flex-start', backgroundColor: Colors.chipBackground,
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginBottom: 12,
    },
    categoryText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
    title: { fontSize: FontSize['3xl'], fontWeight: '700', color: Colors.text, marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    infoText: { fontSize: 14, color: Colors.textSecondary },
    section: { marginTop: 24 },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: 10 },
    description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
    creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    creatorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.borderLight },
    creatorName: { fontSize: 14, fontWeight: '600', color: Colors.text },
    creatorCity: { fontSize: 12, color: Colors.textSecondary },
    attendeesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    attendeesList: { gap: 10, paddingBottom: 120 },
    attendeeItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    attendeeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.borderLight },
    attendeeName: { fontSize: 14, color: Colors.text },
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 12,
        paddingHorizontal: 20, paddingTop: 14,
        backgroundColor: Colors.background,
        borderTopWidth: 1, borderTopColor: Colors.borderLight,
    },
    cancelButton: {
        width: 52, height: 52, borderRadius: 26,
        borderWidth: 2, borderColor: '#FEE2E2',
        backgroundColor: '#FFF5F5',
        justifyContent: 'center', alignItems: 'center',
    },
    chatButton: {
        width: 56, height: 56, borderRadius: 28,
        borderWidth: 2, borderColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
});
