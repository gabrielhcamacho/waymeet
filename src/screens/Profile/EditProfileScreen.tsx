import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField } from '@/src/components/ui/input';
import { CATEGORIES } from '../../data/mockData';
import * as ImagePicker from 'expo-image-picker';
import { SvgUri } from 'react-native-svg';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, updateProfile, deleteAccount } = useUserStore();
    const [name, setName] = useState(user?.displayName || '');
    const [city, setCity] = useState(user?.homeCity || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [secondaryAvatarSeed, setSecondaryAvatarSeed] = useState(user?.secondaryAvatarSeed || '');
    const [coverPhotoUrl, setCoverPhotoUrl] = useState(user?.coverPhotoUrl || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(user?.selectedCategories || []);

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

    const handleSave = () => {
        updateProfile({
            displayName: name,
            homeCity: city,
            bio,
            avatarUrl,
            secondaryAvatarSeed,
            coverPhotoUrl,
            selectedCategories
        });
        navigation.goBack();
    };

    const generateSecondaryAvatar = () => {
        const seed = Math.random().toString(36).substring(2, 10);
        setSecondaryAvatarSeed(seed);
    };

    const dicebearUrl = useMemo(() => {
        if (!secondaryAvatarSeed) return null;
        return `https://api.dicebear.com/9.x/avataaars/svg?seed=${secondaryAvatarSeed}`;
    }, [secondaryAvatarSeed]);

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

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {/* Photo Previews */}
                <View className="mb-6 -mx-5">
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

                {/* Secondary Avatar Section */}
                <View className="mb-6 items-center">
                    <Text className="text-sm font-semibold text-text mb-3">Avatar Secundário (DiceBear)</Text>
                    <View className="flex-row items-center gap-4">
                        <View className="w-[70px] h-[70px] rounded-full bg-gray-100 items-center justify-center overflow-hidden border-2 border-orange-100">
                            {dicebearUrl ? (
                                <SvgUri uri={dicebearUrl} width="100%" height="100%" />
                            ) : (
                                <Ionicons name="person" size={35} color={Colors.text} style={{ opacity: 0.3 }} />
                            )}
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={generateSecondaryAvatar}
                            className="flex-row items-center bg-orange-50 px-4 py-2 rounded-full border border-orange-200"
                        >
                            <Ionicons name="dice-outline" size={20} color={Colors.primary} />
                            <Text className="text-primary font-semibold ml-2">Gerar Avatar</Text>
                        </TouchableOpacity>
                        {secondaryAvatarSeed ? (
                            <TouchableOpacity onPress={() => setSecondaryAvatarSeed('')} className="p-2">
                                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                {/* Removed Photo URLs Inputs */}
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

                {/* Interests Section */}
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
                                    className={`flex-row items-center rounded-full px-4 py-2 border ${isSelected
                                        ? 'bg-orange-50 border-orange-500'
                                        : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className="text-sm mr-1.5">{cat.icon}</Text>
                                    <Text
                                        className={`text-[13px] font-semibold ${isSelected ? 'text-orange-600' : 'text-gray-500'
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
            </ScrollView>
        </View>
    );
};