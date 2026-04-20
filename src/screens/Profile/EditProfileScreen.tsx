import { Colors } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useMemo } from 'react';
import { supabase } from '../../config/supabase';
import { TextField } from './components/edit/TextField';
import { PhotoHeader } from './components/edit/PhotoHeader';
import { TabSwitcher } from './components/edit/TabSwitcher';
import { useUserStore } from '../../store/useUserStore';
import { AvatarPreview } from './components/edit/AvatarPreview';
import { AvatarOptionRow } from './components/edit/AvatarOptionRow';
import { CategorySelector } from './components/edit/CategorySelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import {
    AVATAR_OPTIONS,
    HAIR_GENDER,
    OUTFIT_GENDER,
    getOutfitsByGender,
    getDefaultOutfit,
    AVATAR_CATEGORY_ORDER,
    AVATAR_CATEGORY_ICONS,
    CATEGORY_LABELS,
    buildBitmojiUrl,
    serializeConfig,
    parseConfig,
    DEFAULT_AVATAR_CONFIG,
    COLOR_LABELS,
    type AvatarConfig,
} from '@/src/utils/avatarConfig';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, updateProfile, deleteAccount } = useUserStore();

    const [activeTab, setActiveTab] = useState<'info' | 'avatar'>('info');
    const [name, setName] = useState(user?.displayName || '');
    const [city, setCity] = useState(user?.homeCity || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [coverPhotoUrl, setCoverPhotoUrl] = useState(user?.coverPhotoUrl || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        user?.selectedCategories || [],
    );
    const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() =>
        parseConfig(user?.secondaryAvatarSeed || ''),
    );
    const [isSaving, setIsSaving] = useState(false);
    const [activeAvatarCategory, setActiveAvatarCategory] = useState<typeof AVATAR_CATEGORY_ORDER[number]>(
        AVATAR_CATEGORY_ORDER[0],
    );

    // Current effective gender (driven by hair selection)
    const currentGender = useMemo((): '1' | '2' => {
        const hairG = HAIR_GENDER[avatarConfig.hair];
        return hairG ?? (avatarConfig.gender as '1' | '2') ?? '1';
    }, [avatarConfig.hair, avatarConfig.gender]);

    const bitmojiPreviewUrl = useMemo(() => buildBitmojiUrl(avatarConfig), [avatarConfig]);

    // ── Options for the active category ───────────────────────────────────────
    // For outfit: dynamically filtered by currentGender.
    // For everything else: use the static AVATAR_OPTIONS list.
    const currentOptions = useMemo(() => {
        if (activeAvatarCategory === 'outfit') {
            return getOutfitsByGender(currentGender);
        }
        return AVATAR_OPTIONS[activeAvatarCategory] ?? [];
    }, [activeAvatarCategory, currentGender]);

    // ── Selection handler ──────────────────────────────────────────────────────
    const handleAvatarOptionSelect = (key: string, val: string) => {
        setAvatarConfig(prev => {
            const next: AvatarConfig = { ...prev, [key]: val };

            if (key === 'hair') {
                const newGender = HAIR_GENDER[val];
                if (newGender) {
                    next.gender = newGender;
                    // If the current outfit doesn't belong to the new gender, reset it
                    const validOutfits = getOutfitsByGender(newGender);
                    if (!validOutfits.includes(prev.outfit)) {
                        next.outfit = getDefaultOutfit(newGender);
                    }
                }
            }

            return next;
        });
    };

    // ── Randomize ─────────────────────────────────────────────────────────────
    const handleRandomize = () => {
        const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

        const hair = pick(AVATAR_OPTIONS.hair);
        const gender = HAIR_GENDER[hair] ?? '1';
        const body = pick(AVATAR_OPTIONS.body);
        const outfit = pick(getOutfitsByGender(gender));

        setAvatarConfig({
            ...DEFAULT_AVATAR_CONFIG,
            gender,
            skin_tone: pick(AVATAR_OPTIONS.skin_tone),
            hair,
            hair_tone: pick(AVATAR_OPTIONS.hair_tone),
            eye: pick(AVATAR_OPTIONS.eye),
            pupil_tone: pick(AVATAR_OPTIONS.pupil_tone),
            brow: pick(AVATAR_OPTIONS.brow),
            nose: pick(AVATAR_OPTIONS.nose),
            mouth: pick(AVATAR_OPTIONS.mouth),
            beard: pick(AVATAR_OPTIONS.beard),
            body,
            outfit,
            backgroundColor: pick(AVATAR_OPTIONS.backgroundColor),
        });
    };

    const toggleCategory = (id: string) =>
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
        );

    const pickImage = async (type: 'avatar' | 'cover') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.length) {
            if (type === 'avatar') setAvatarUrl(result.assets[0].uri);
            else setCoverPhotoUrl(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        const { user } = useUserStore.getState();
        if (!user) return;

        setIsSaving(true);
        try {
            let finalAvatarUrl = avatarUrl;
            let finalCoverUrl = coverPhotoUrl;

            // Upload avatar if it's a local file URI
            if (avatarUrl && !avatarUrl.startsWith('http')) {
                const response = await fetch(avatarUrl);
                const arrayBuffer = await response.arrayBuffer();
                const path = `${user.id}/${Date.now()}_avatar.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
                if (!uploadError) {
                    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
                    finalAvatarUrl = data.publicUrl;
                }
            }

            // Upload cover photo if it's a local file URI
            if (coverPhotoUrl && !coverPhotoUrl.startsWith('http')) {
                const response = await fetch(coverPhotoUrl);
                const arrayBuffer = await response.arrayBuffer();
                const path = `${user.id}/${Date.now()}_cover.jpg`;
                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
                if (!uploadError) {
                    const { data } = supabase.storage.from('covers').getPublicUrl(path);
                    finalCoverUrl = data.publicUrl;
                }
            }

            updateProfile({
                displayName: name,
                homeCity: city,
                bio,
                avatarUrl: finalAvatarUrl,
                secondaryAvatarSeed: serializeConfig(avatarConfig),
                coverPhotoUrl: finalCoverUrl,
                selectedCategories,
            });
            navigation.goBack();
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Erro', 'Não foi possível salvar as alterações. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Excluir conta', 'Tem certeza? Esta ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => deleteAccount() },
        ]);
    };

    return (
        <View className="flex-1 bg-white px-5" style={{ paddingTop: insets.top + 10 }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text">Editar Perfil</Text>
                <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                    <Text className="text-base font-semibold text-primary">{isSaving ? 'Salvando...' : 'Salvar'}</Text>
                </TouchableOpacity>
            </View>

            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'info' ? (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                >
                    <PhotoHeader
                        coverPhotoUrl={coverPhotoUrl}
                        avatarUrl={avatarUrl}
                        onPickCover={() => pickImage('cover')}
                        onPickAvatar={() => pickImage('avatar')}
                    />
                    <TextField label="Nome" placeholder="Seu nome" value={name} onChangeText={setName} />
                    <TextField label="Cidade" placeholder="Sua cidade" value={city} onChangeText={setCity} />
                    <TextField
                        label="Bio"
                        placeholder="Sobre você..."
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        height={100}
                    />
                    <CategorySelector
                        selectedCategories={selectedCategories}
                        onToggle={toggleCategory}
                    />
                    <TouchableOpacity
                        className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-[1.5px] border-error mt-[30px]"
                        onPress={handleDelete}
                    >
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                        <Text className="text-[15px] font-semibold text-error">Excluir conta</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <View className="flex-1 mt-3">
                    <AvatarPreview
                        avatarUrl={bitmojiPreviewUrl}
                        backgroundColor={
                            COLOR_LABELS[avatarConfig.backgroundColor]?.hex ||
                            avatarConfig.backgroundColor
                        }
                        isZoomed={new Set([
                            'skin_tone', 'hair', 'hair_tone', 'eye', 'pupil_tone',
                            'brow', 'nose', 'mouth', 'beard',
                            'face_proportion', 'eye_spacing', 'eye_size',
                        ]).has(activeAvatarCategory)}
                        onRandomize={handleRandomize}
                    />

                    {/* Category Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 4, gap: 2 }}
                        className="mb-2"
                        style={{ flexGrow: 0 }}
                    >
                        {AVATAR_CATEGORY_ORDER.map(cat => {
                            const isActive = activeAvatarCategory === cat;
                            const iconName = AVATAR_CATEGORY_ICONS[cat] as keyof typeof Ionicons.glyphMap;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setActiveAvatarCategory(cat)}
                                    className={`items-center justify-center px-3 py-2 rounded-xl ${isActive ? 'bg-orange-50' : ''}`}
                                    style={{ minWidth: 56 }}
                                >
                                    <Ionicons
                                        name={iconName}
                                        size={22}
                                        color={isActive ? Colors.primary : Colors.textMuted}
                                    />
                                    <Text
                                        className={`text-[9px] mt-1 ${isActive ? 'text-orange-600 font-bold' : 'text-gray-400'}`}
                                        numberOfLines={1}
                                    >
                                        {CATEGORY_LABELS[cat]}
                                    </Text>
                                    {isActive && (
                                        <View className="w-5 h-[2.5px] bg-orange-500 rounded-full mt-1" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <Text className="text-sm font-bold text-text px-4 mt-2 mb-1">
                        {CATEGORY_LABELS[activeAvatarCategory]}
                    </Text>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                        className="flex-1"
                    >
                        <AvatarOptionRow
                            category={activeAvatarCategory}
                            options={currentOptions}
                            selectedValue={avatarConfig[activeAvatarCategory]}
                            onSelect={handleAvatarOptionSelect}
                        />
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

// ─── Internal helper (not exported) ───────────────────────────────────────────