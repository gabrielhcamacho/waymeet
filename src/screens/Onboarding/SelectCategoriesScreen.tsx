import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, BorderRadius, Shadows } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { CategoryChip } from '../../components/CategoryChip';
import { CATEGORIES } from '../../data/mockData';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { locationService } from '../../services/locationService';

export const SelectCategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, setSelectedCategories, completeOnboarding } = useUserStore();
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        locationService.requestPermission();
    }, []);

    const toggleCategory = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const handleContinue = () => {
        setSelectedCategories(selected);
        completeOnboarding();
    };

    const renderItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
        <View style={styles.chipWrapper}>
            <CategoryChip
                label={item.name}
                icon={item.icon}
                selected={selected.includes(item.id)}
                onPress={() => toggleCategory(item.id)}
                style={styles.chip}
            />
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    Bem Vindo, {user?.displayName || 'Viajante'} 👋
                </Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.locationText}>{user?.homeCity || 'Londrina, Brasil'}</Text>
                </View>
            </View>

            <Text style={styles.title}>Selecione os seus interesses{'\n'}de passeios</Text>

            {/* Categories Grid */}
            <FlatList
                data={CATEGORIES}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.row}
            />

            {/* Continue Button */}
            <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
                <TouchableOpacity
                    onPress={handleContinue}
                    style={[styles.continueButton, selected.length === 0 && styles.buttonDisabled]}
                    disabled={selected.length === 0}
                    activeOpacity={0.85}
                >
                    <Text style={styles.continueText}>Começar</Text>
                    <Ionicons name="arrow-forward" size={20} color={Colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: FontSize['2xl'],
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    title: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 24,
        lineHeight: 26,
    },
    grid: {
        paddingBottom: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    chipWrapper: {
        width: '48%',
    },
    chip: {
        width: '100%',
    },
    bottomContainer: {
        paddingTop: 12,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
        ...Shadows.subtle,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    continueText: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
    },
});
