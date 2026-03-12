import { Colors } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import React, { useState, useMemo } from 'react';
import { TextField } from './components/TextField';
import { PhotoHeader } from './components/PhotoHeader';
import { TabSwitcher } from './components/TabSwitcher';
import { useUserStore } from '../../store/useUserStore';
import { AvatarPreview } from './components/AvatarPreview';
import { AvatarOptionRow } from './components/AvatarOptionRow';
import { CategorySelector } from './components/CategorySelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';

const AVATAR_OPTIONS = {
    top: ['longHair', 'shortHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand', 'miaWallace', 'shaggy', 'shaggyMullet', 'shavedSides', 'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'straight01', 'straight02', 'straightAndStrand'],
    hairColor: ['2c1b18', '4a3123', '724133', 'a55728', 'b58143', 'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'],
    eyes: ['close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
    mouth: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'smirk', 'spit', 'twinkle', 'vomit'],
    skinColor: ['614335', 'ae5d29', 'd08b5b', 'edb98a', 'f8d25c', 'fd9841', 'ffdbb4'],
    clothes: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'],
} as const;

type AvatarConfig = Record<string, string> & { seed: string };

function parseSeed(seedStr: string): AvatarConfig {
    if (seedStr.includes('=')) {
        const obj: Record<string, string> = {};
        seedStr.split('&').forEach((part) => {
            const [key, value] = part.split('=');
            if (key && value) obj[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        if (!obj.seed) obj.seed = Math.random().toString(36).substring(2, 10);
        return obj as AvatarConfig;
    };
    return { seed: seedStr || Math.random().toString(36).substring(2, 10) }
};

function serializeConfig(config: AvatarConfig): string {
    return Object.entries(config)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
}

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
        parseSeed(user?.secondaryAvatarSeed || ''),
    );

    const dicebearUrl = useMemo(() => {
        const params = serializeConfig(avatarConfig);
        return `https://api.dicebear.com/9.x/avataaars/svg?${params}`;
    }, [avatarConfig]);

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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {activeTab === 'info' ? (
                    <>
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
                    </>
                ) : (
                    <View className="mt-6 mb-8">
                        <AvatarPreview
                            dicebearUrl={dicebearUrl}
                            onRandomize={() =>
                                setAvatarConfig({ seed: Math.random().toString(36).substring(2, 10) })
                            }
                        />
                        {(Object.keys(AVATAR_OPTIONS) as (keyof typeof AVATAR_OPTIONS)[]).map((cat) => (
                            <AvatarOptionRow
                                key={cat}
                                category={cat}
                                options={AVATAR_OPTIONS[cat]}
                                selectedValue={avatarConfig[cat]}
                                onSelect={(key, val) =>
                                    setAvatarConfig((prev) => ({ ...prev, [key]: val }))
                                }
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};