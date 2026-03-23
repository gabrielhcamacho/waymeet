import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProfileStats } from './components/index/ProfileStats';
import { ProfileInterests } from './components/index/ProfileInterests';
import { ProfileCommunities } from './components/index/ProfileCommunities';
import { useFriendsStore } from '../../store/useFriendsStore';
import { useEventsStore } from '../../store/useEventsStore';
import { MOCK_COMMUNITIES } from '../../data/mockData';
import { Colors } from '../../config/theme';
import { User } from '../../types';

import { FlipAvatar } from './components/index/FlipAvatar';

export const PublicProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const route = useRoute<any>();
    
    // Pass the user object through navigation params
    const profileUser: User = route.params?.user;
    
    const { events } = useEventsStore();
    const { getFriendStatus, sendFriendRequest, acceptFriendRequest, removeFriendOrRequest } = useFriendsStore();
    
    if (!profileUser) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Usuário não encontrado.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4">
                    <Text className="text-blue-500">Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const friendStatus = getFriendStatus(profileUser.id);
    const userEvents = events.filter((e) => e.creatorId === profileUser.id);
    const userCommunities = MOCK_COMMUNITIES.slice(0, 3); // mocked

    const handleFriendAction = async () => {
        try {
            if (friendStatus === 'none') {
                await sendFriendRequest(profileUser.id);
                Alert.alert('Sucesso', 'Solicitação de amizade enviada!');
            } else if (friendStatus === 'pending') {
                await acceptFriendRequest(profileUser.id);
                Alert.alert('Sucesso', 'Vocês agora são amigos!');
            } else if (friendStatus === 'accepted') {
                Alert.alert(
                    'Remover Amigo',
                    'Deseja realmente remover esta pessoa dos seus amigos?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Remover', style: 'destructive', onPress: () => removeFriendOrRequest(profileUser.id) }
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível completar a ação.');
        }
    };

    const getFriendButtonConfig = () => {
        switch (friendStatus) {
            case 'none':
                return { label: 'Adicionar Amigo', icon: 'person-add', bgClass: 'bg-blue-600', textClass: 'text-white' };
            case 'pending':
                return { label: 'Solicitado', icon: 'time', bgClass: 'bg-gray-200', textClass: 'text-gray-800' };
            case 'accepted':
                return { label: 'Amigos', icon: 'checkmark-circle', bgClass: 'bg-green-100', textClass: 'text-green-800' };
            default:
                return { label: 'Adicionar Amigo', icon: 'person-add', bgClass: 'bg-blue-600', textClass: 'text-white' };
        }
    };

    const btnConfig = getFriendButtonConfig();

    return (
        <View className="flex-1 bg-white">
            <View style={{ paddingTop: insets.top, paddingHorizontal: 16, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">{profileUser.displayName}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center px-5 pt-4">
                    <FlipAvatar
                        avatarUrl={profileUser.avatarUrl || ''}
                        bitmojiConfig={profileUser.secondaryAvatarSeed || ''}
                    />
                    <Text className="text-xl font-bold text-gray-900 text-center mt-3">{profileUser.displayName}</Text>
                    
                    <View className="flex-row items-center gap-3 mt-2 mb-4">
                        <View className="bg-gray-100 rounded-full px-3 py-1">
                            <Text className="text-[12px] font-semibold text-gray-500">
                                {profileUser.mode === 'morador' ? '🏠 morador' : '✈️ visitante'}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text className="text-[13px] font-bold text-amber-600">
                                {profileUser.reputation?.toFixed(1) || '0.0'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        onPress={handleFriendAction}
                        className={`flex-row items-center justify-center py-3 px-6 rounded-full w-full mb-6 ${btnConfig.bgClass}`}
                    >
                        <Ionicons name={btnConfig.icon as any} size={20} color={btnConfig.textClass.includes('white') ? 'white' : Colors.text} />
                        <Text className={`font-bold ml-2 ${btnConfig.textClass}`}>{btnConfig.label}</Text>
                    </TouchableOpacity>
                </View>

                {profileUser.bio ? (
                    <View className="px-5 mb-6">
                        <Text className="text-base font-bold text-gray-900 mb-2">Sobre</Text>
                        <Text className="text-gray-600 leading-6">{profileUser.bio}</Text>
                    </View>
                ) : null}

                <ProfileStats
                    followersCount={profileUser.followersCount}
                    followingCount={profileUser.followingCount}
                    eventsCount={userEvents.length}
                />

                <ProfileInterests selectedCategories={profileUser.selectedCategories || []} />

                <ProfileCommunities communities={userCommunities} />

            </ScrollView>
        </View>
    );
};
