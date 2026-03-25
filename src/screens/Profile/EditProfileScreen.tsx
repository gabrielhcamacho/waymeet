import { Colors } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useMemo, useEffect } from 'react';
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
    AVATAR_OPTIONS_GENDERED,
    GENERIC_OPTIONS,
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
    const [activeAvatarCategory, setActiveAvatarCategory] = useState<typeof AVATAR_CATEGORY_ORDER[number]>(AVATAR_CATEGORY_ORDER[0]);

    // This is the generated Bitmoji preview URL
    const bitmojiPreviewUrl = useMemo(() => buildBitmojiUrl(avatarConfig), [avatarConfig]);

    // Handle initial gender setup or trait validation if gender changes
    useEffect(() => {
        const genderOptions = AVATAR_OPTIONS_GENDERED[avatarConfig.gender];
        if (!genderOptions) return;

        // Ensure current traits are valid for this gender (mostly for hair/beard/brow/mouth)
        const checkTraits = ['hair', 'brow', 'mouth', 'beard', 'body'];
        let needsUpdate = false;
        const newConfig = { ...avatarConfig };

        checkTraits.forEach(trait => {
            const options = genderOptions[trait];
            if (options && !options.includes(newConfig[trait])) {
                newConfig[trait] = options[0];
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            setAvatarConfig(newConfig);
        }
    }, [avatarConfig.gender]);

    const toggleCategory = (id: string) =>
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
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

    const handleSave = () => {
        updateProfile({
            displayName: name,
            homeCity: city,
            bio,
            avatarUrl,
            secondaryAvatarSeed: serializeConfig(avatarConfig),
            coverPhotoUrl,
            selectedCategories,
        });
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Excluir conta', 'Tem certeza? Esta ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => deleteAccount() },
        ]);
    };

    const handleRandomize = () => {
        const pick = (arr: readonly string[]) => arr[Math.floor(Math.random() * arr.length)];
        const gender = pick(['1', '2']);
        const genderOptions = AVATAR_OPTIONS_GENDERED[gender];
        const generic = GENERIC_OPTIONS;

        setAvatarConfig({
            ...DEFAULT_AVATAR_CONFIG,
            gender,
            skin_tone: pick(genderOptions.skin_tone),
            hair: pick(genderOptions.hair),
            hair_tone: pick(genderOptions.hair_tone),
            eye: pick(genderOptions.eye),
            pupil_tone: pick(genderOptions.pupil_tone),
            brow: pick(genderOptions.brow),
            nose: pick(genderOptions.nose),
            mouth: pick(genderOptions.mouth),
            beard: pick(genderOptions.beard),
            body: pick(genderOptions.body),
            outfit: pick(generic.outfit),
            backgroundColor: pick(generic.backgroundColor),
        });
    };

    const handleAvatarOptionSelect = (key: string, val: string) => {
        setAvatarConfig((prev) => ({ ...prev, [key]: val }));
    };

    // Get available options for current category and gender
    const currentOptions = useMemo(() => {
        const genderOptions = AVATAR_OPTIONS_GENDERED[avatarConfig.gender];
        return genderOptions[activeAvatarCategory] || (GENERIC_OPTIONS as any)[activeAvatarCategory] || [];
    }, [activeAvatarCategory, avatarConfig.gender]);

    return (
        <View className="flex-1 bg-white px-5" style={{ paddingTop: insets.top + 10 }}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text">Editar Perfil</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-base font-semibold text-primary">Salvar</Text>
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
                    {/* Avatar Preview — Fixed on top */}
                    <AvatarPreview
                        avatarUrl={bitmojiPreviewUrl}
                        backgroundColor={COLOR_LABELS[avatarConfig.backgroundColor]?.hex || avatarConfig.backgroundColor}
                        isZoomed={new Set(['skin_tone', 'hair', 'hair_tone', 'eye', 'pupil_tone', 'brow', 'nose', 'mouth', 'beard', 'face_proportion', 'eye_spacing', 'eye_size']).has(activeAvatarCategory)}
                        onRandomize={handleRandomize}
                    />

                    {/* Category Tabs — Horizontal scrollable icons */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 4, gap: 2 }}
                        className="mb-2"
                        style={{ flexGrow: 0 }}
                    >
                        {AVATAR_CATEGORY_ORDER.map((cat) => {
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

                    {/* Category label */}
                    <Text className="text-sm font-bold text-text px-4 mt-2 mb-1">
                        {CATEGORY_LABELS[activeAvatarCategory]}
                    </Text>

                    {/* Options for the active category */}
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