import React, { useState } from 'react';
import {
    View, TouchableOpacity, TextInput, StyleSheet,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../config/theme';
import { useUserStore } from '../../store/useUserStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { supabase } from '../../config/supabase';

export const CreateCommunityModal: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const { fetchCommunities } = useCommunityStore();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canSubmit = name.trim().length >= 3 && !loading;

    const handleCreate = async () => {
        if (!canSubmit || !user) return;
        setLoading(true);
        setError('');
        try {
            const { error: err } = await supabase.from('communities').insert({
                name: name.trim(),
                description: description.trim(),
                creator_id: user.id,
            });
            if (err) throw err;
            await fetchCommunities();
            navigation.goBack();
        } catch (e: any) {
            setError(e?.message || 'Erro ao criar comunidade. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                    <Ionicons name="close" size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Comunidade</Text>
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!canSubmit}
                    style={[styles.saveBtn, !canSubmit && { opacity: 0.4 }]}
                >
                    {loading
                        ? <ActivityIndicator size="small" color={Colors.textInverse} />
                        : <Text style={styles.saveBtnText}>Criar</Text>
                    }
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.field}>
                    <Text style={styles.label}>Nome *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Ex: Fotógrafos de Londrina"
                        placeholderTextColor={Colors.textMuted}
                        maxLength={60}
                        autoFocus
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Descrição</Text>
                    <TextInput
                        style={[styles.input, styles.inputMultiline]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Sobre o que é essa comunidade?"
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={200}
                    />
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: Colors.background,
    },
    closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.text },
    saveBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 60,
        alignItems: 'center',
    },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textInverse },
    content: { padding: 20, gap: 20 },
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.text,
    },
    inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        padding: 12,
    },
    errorText: { fontSize: 13, color: '#DC2626', flex: 1 },
});
