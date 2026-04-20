import React, { useState, useRef, useEffect } from 'react';
import {
    View, StyleSheet, FlatList, TouchableOpacity, TextInput,
    KeyboardAvoidingView, Platform, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { useChatStore } from '../../store/useChatStore';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from '../../types';
import { getTimeAgo } from '../../utils/helpers';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useEventsStore } from '../../store/useEventsStore';

export const ChatScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { eventId, eventTitle, chatType = 'event' } = route.params;
    const { messages, fetchMessages, sendMessage, subscribeToRoom } = useChatStore();
    const { user } = useUserStore();
    const [text, setText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const eventMessages = messages[eventId] || [];
    const { events } = useEventsStore();
    const { activeUsers } = usePresenceStore();

    // Count online members from event attendees
    const currentEvent = events.find((e) => e.id === eventId);
    const attendeeIds = currentEvent?.attendees.map((a) => a.id) || [];
    const onlineCount = activeUsers.filter((u) => {
        const ago = Date.now() - new Date(u.lastActive).getTime();
        return attendeeIds.includes(u.id) && ago < 10 * 60 * 1000;
    }).length;

    useEffect(() => {
        fetchMessages(eventId, chatType);
        const unsubscribe = subscribeToRoom(eventId, chatType);
        return unsubscribe;
    }, [eventId]);

    const handleSend = () => {
        if (!text.trim() || !user) return;
        sendMessage(eventId, user.id, text.trim(), chatType);
        setText('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        if (item.isSystem) {
            return (
                <View style={styles.systemMessage}>
                    <Text style={styles.systemText}>{item.text}</Text>
                </View>
            );
        }
        const isMe = item.userId === user?.id;
        return (
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                {!isMe && (
                    <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { user: item.user })}>
                        <ImageBackground source={{ uri: item.user.avatarUrl }}
                            style={styles.messageAvatar} imageStyle={{ borderRadius: 16 }} />
                    </TouchableOpacity>
                )}
                <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                    {!isMe && <Text style={styles.senderName}>{item.user.displayName}</Text>}
                    <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.text}</Text>
                    <Text style={[styles.timestamp, isMe && styles.timestampMe]}>{getTimeAgo(item.timestamp)}</Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{eventTitle}</Text>
                    <Text style={styles.headerSub}>
                        Chat do encontro{onlineCount > 0 ? ` · ` : ''}
                    </Text>
                    {onlineCount > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' }} />
                            <Text style={[styles.headerSub, { color: '#22C55E', fontWeight: '600' }]}>
                                {onlineCount} online
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <FlatList ref={flatListRef} data={eventMessages} renderItem={renderMessage}
                keyExtractor={(item) => item.id} contentContainerStyle={{ padding: 16 }}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })} />
            <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
                <View style={styles.inputWrap}>
                    <TextInput style={styles.input} value={text} onChangeText={setText}
                        placeholder="Mensagem..." placeholderTextColor={Colors.textMuted} multiline />
                </View>
                <TouchableOpacity style={[styles.sendBtn, !text.trim() && { opacity: 0.5 }]}
                    onPress={handleSend} disabled={!text.trim()}>
                    <Ionicons name="send" size={20} color={Colors.textInverse} />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.surface },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12,
        backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
    headerSub: { fontSize: 12, color: Colors.textSecondary },
    systemMessage: {
        alignSelf: 'center', backgroundColor: Colors.borderLight,
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginVertical: 8,
    },
    systemText: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
    messageRowMe: { flexDirection: 'row-reverse' },
    messageAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.borderLight },
    messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
    bubbleOther: { backgroundColor: Colors.background, borderBottomLeftRadius: 4, ...Shadows.subtle },
    bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
    senderName: { fontSize: 11, fontWeight: '600', color: Colors.primary, marginBottom: 4 },
    messageText: { fontSize: 14, color: Colors.text, lineHeight: 20 },
    messageTextMe: { color: Colors.textInverse },
    timestamp: { fontSize: 10, color: Colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
    timestampMe: { color: 'rgba(255,255,255,0.7)' },
    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8,
        backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: 8,
    },
    inputWrap: {
        flex: 1, backgroundColor: Colors.surface, borderRadius: 24,
        paddingHorizontal: 16, paddingVertical: 10, minHeight: 44,
        borderWidth: 1, borderColor: Colors.borderLight,
    },
    input: { fontSize: 14, color: Colors.text, maxHeight: 100 },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center', marginBottom: 2,
    },
});
