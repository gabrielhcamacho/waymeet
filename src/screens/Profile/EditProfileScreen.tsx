import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField } from '@/src/components/ui/input';
import { CATEGORIES } from '../../data/mockData';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

const AVATAR_OPTIONS = {
    top: ['longHair', 'shortHair', 'eyepatch', 'hat', 'hijab', 'turban', 'winterHat1', 'winterHat2', 'winterHat3', 'winterHat4', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'frida', 'fro', 'froBand', 'miaWallace', 'shaggy', 'shaggyMullet', 'shavedSides', 'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'straight01', 'straight02', 'straightAndStrand'],
    hairColor: ['2c1b18', '4a3123', '724133', 'a55728', 'b58143', 'c93305', 'd6b370', 'e8e1e1', 'ecdcbf', 'f59797'],
    eyes: ['close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts', 'side', 'squint', 'surprised', 'wink', 'winkWacky'],
    mouth: ['concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad', 'screamOpen', 'serious', 'smile', 'smirk', 'spit', 'twinkle', 'vomit'],
    skinColor: ['614335', 'ae5d29', 'd08b5b', 'edb98a', 'f8d25c', 'fd9841', 'ffdbb4'],
    clothes: ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck']
};

const OPTION_LABELS: Record<keyof typeof AVATAR_OPTIONS, string> = {
    top: 'Cabelo',
    hairColor: 'Cor do Cabelo',
    eyes: 'Olhos',
    mouth: 'Boca',
    skinColor: 'Tom de Pele',
    clothes: 'Roupas'
};

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, updateProfile, deleteAccount } = useUserStore();
    
    const [activeTab, setActiveTab] = useState<'info' | 'avatar'>('info');
    
    const [name, setName] = useState(user?.displayName || '');
    const [city, setCity] = useState(user?.homeCity || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [coverPhotoUrl, setCoverPhotoUrl] = useState(user?.coverPhotoUrl || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(user?.selectedCategories || []);

    const [avatarConfig, setAvatarConfig] = useState<Record<string, string>>(() => {
        const seedStr = user?.secondaryAvatarSeed || '';
        if (seedStr.includes('=')) {
            const obj: Record<string, string> = {};
            seedStr.split('&').forEach(part => {
                const [k, v] = part.split('=');
                if (k && v) obj[decodeURIComponent(k)] = decodeURIComponent(v);
            });
            // Ensure there's a seed
            if (!obj.seed) obj.seed = Math.random().toString(36).substring(2, 10);
            return obj;
        } else {
            return { seed: seedStr || Math.random().toString(36).substring(2, 10) };
        }
    });

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            }
            return [...prev, categoryId];
        });
    };

    const pickImage = async (type: 'avatar' | 'cover') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (type === 'avatar') {
                setAvatarUrl(result.assets[0].uri);
            } else {
                setCoverPhotoUrl(result.assets[0].uri);
            }
        }
    };

    const updateAvatarConfig = (key: string, value: string) => {
        setAvatarConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        const finalSeedStr = Object.entries(avatarConfig)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');

        updateProfile({
            displayName: name,
            homeCity: city,
            bio,
            avatarUrl,
            secondaryAvatarSeed: finalSeedStr,
            coverPhotoUrl,
            selectedCategories
        });
        navigation.goBack();
    };

    const dicebearUrl = useMemo(() => {
        if (!avatarConfig.seed && Object.keys(avatarConfig).length === 0) return null;
        const params = Object.entries(avatarConfig)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        return `https://api.dicebear.com/9.x/avataaars/svg?${params}`;
    }, [avatarConfig]);

    const randomizeAvatar = () => {
        setAvatarConfig({ seed: Math.random().toString(36).substring(2, 10) });
    };

    const renderInfoTab = () => (
        <>
            {/* Photo Previews */}
            <View className="mb-6 -mx-5 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => pickImage('cover')}
                    className="h-[150px] bg-gray-200 relative"
                >
                    {coverPhotoUrl ? (
                        <ImageBackground source={{ uri: coverPhotoUrl }} className="w-full h-full">
                            <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
                            </View>
                        </ImageBackground>
                    ) : null}
                    <View
                        className="absolute bg-black/40 w-10 h-10 rounded-full items-center justify-center top-1/2 left-1/2 -ml-5 -mt-5"
                    >
                        <Ionicons name="camera" size={20} color="white" />
                    </View>
                </TouchableOpacity>

                <View className="items-center -mt-[45px]">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => pickImage('avatar')}
                        className="w-[90px] h-[90px] rounded-full border-4 border-white bg-gray-100 overflow-hidden relative"
                    >
                        {avatarUrl ? (
                            <ImageBackground source={{ uri: avatarUrl }} className="w-full h-full" />
                        ) : null}
                        <View className="absolute inset-0 bg-black/30 items-center justify-center">
                            <Ionicons name="camera" size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mb-5">
                <Text className="text-sm font-semibold text-text mb-2">Nome</Text>
                <Input variant="outline" size="xl" className="rounded-lg border-border flex-row items-center">
                    <InputField
                        placeholder="Seu nome"
                        value={name}
                        onChangeText={setName}
                        className="flex-1 text-[15px] text-text px-[14px] py-3"
                    />
                </Input>
            </View>

            <View className="mb-5">
                <Text className="text-sm font-semibold text-text mb-2">Cidade</Text>
                <Input variant="outline" size="xl" className="rounded-lg border-border flex-row items-center">
                    <InputField
                        placeholder="Sua cidade"
                        value={city}
                        onChangeText={setCity}
                        className="flex-1 text-[15px] text-text px-[14px] py-3"
                    />
                </Input>
            </View>

            <View className="mb-5">
                <Text className="text-sm font-semibold text-text mb-2">Bio</Text>
                <Input variant="outline" size="xl" className="rounded-lg border-border flex-row items-center h-[100px]">
                    <InputField
                        placeholder="Sobre você..."
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        className="flex-1 text-[15px] text-text px-[14px] pt-3"
                        style={{ textAlignVertical: 'top' }}
                    />
                </Input>
            </View>

            <View className="mb-5">
                <Text className="text-sm font-semibold text-text mb-3">Seus Interesses</Text>
                <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                activeOpacity={0.7}
                                onPress={() => toggleCategory(cat.id)}
                                className={`flex-row items-center rounded-full px-4 py-2 border ${
                                    isSelected ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200'
                                }`}
                            >
                                <Text className="text-sm mr-1.5">{cat.icon}</Text>
                                <Text
                                    className={`text-[13px] font-semibold ${
                                        isSelected ? 'text-orange-600' : 'text-gray-500'
                                    }`}
                                >
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity
                className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-[1.5px] border-error mt-[30px]"
                onPress={handleDelete}
            >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
                <Text className="text-[15px] font-semibold text-error">Excluir conta</Text>
            </TouchableOpacity>
        </>
    );

    const renderAvatarTab = () => (
        <View className="mt-6 mb-8">
            <View className="items-center mb-6">
                <View className="w-[120px] h-[120px] rounded-full bg-gray-100 items-center justify-center overflow-hidden border-[3px] border-orange-100">
                    {dicebearUrl ? (
                        <Image 
                            source={{ uri: dicebearUrl }} 
                            style={{ width: '100%', height: '100%' }} 
                            contentFit="contain" 
                        />
                    ) : (
                        <Ionicons name="person" size={50} color={Colors.text} style={{ opacity: 0.3 }} />
                    )}
                </View>
                
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={randomizeAvatar}
                    className="flex-row items-center bg-orange-50 px-5 py-2.5 rounded-full border border-orange-200 mt-5"
                >
                    <Ionicons name="dice-outline" size={20} color={Colors.primary} />
                    <Text className="text-primary font-semibold ml-2">Aleatório</Text>
                </TouchableOpacity>
            </View>

            {Object.entries(AVATAR_OPTIONS).map(([category, options]) => (
                <View key={category} className="mb-6">
                    <Text className="text-sm font-semibold text-text mb-3 px-1">
                        {OPTION_LABELS[category as keyof typeof AVATAR_OPTIONS]}
                    </Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 4 }}
                    >
                        {options.map((opt) => {
                            const isSelected = avatarConfig[category] === opt;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    onPress={() => updateAvatarConfig(category, opt)}
                                    className={`mr-3 px-4 py-2 rounded-lg border ${
                                        isSelected ? 'bg-orange-50 border-orange-500' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <Text className={`text-[13px] ${isSelected ? 'font-semibold text-orange-600' : 'text-gray-600'}`}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            ))}
        </View>
    );

    const handleDelete = () => {
        Alert.alert('Excluir conta', 'Tem certeza? Esta ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => deleteAccount() },
        ]);
    };

    return (
        <View
            className="flex-1 bg-white px-5"
            style={{ paddingTop: insets.top + 10 }}
        >
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

            {/* Custom Tabs */}
            <View className="flex-row mb-2 bg-gray-100 p-1 rounded-xl">
                <TouchableOpacity 
                    className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'info' ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setActiveTab('info')}
                >
                    <Text className={`font-semibold ${activeTab === 'info' ? 'text-text' : 'text-gray-500'}`}>Informações</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    className={`flex-1 py-2 items-center rounded-lg ${activeTab === 'avatar' ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => setActiveTab('avatar')}
                >
                    <Text className={`font-semibold ${activeTab === 'avatar' ? 'text-text' : 'text-gray-500'}`}>Avatar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {activeTab === 'info' ? renderInfoTab() : renderAvatarTab()}
            </ScrollView>
        </View>
    );
};