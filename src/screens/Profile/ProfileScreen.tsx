import React, { useState } from 'react';
import { View, ScrollView, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/useUserStore';
import { useEventsStore } from '../../store/useEventsStore';
import { MOCK_COMMUNITIES } from '../../data/mockData';
import { HostBadge } from '../../components/HostBadge';
import { ProfileHeader } from './components/index/ProfileHeader';
import { ProfileStats } from './components/index/ProfileStats';
import { ProfileInterests } from './components/index/ProfileInterests';
import { ProfileCommunities } from './components/index/ProfileCommunities';
import { ProfileTabs } from './components/index/ProfileTabs';
import { ProfileMenuDrawer } from './components/index/ProfileMenuDrawer';

const { width } = Dimensions.get('window');

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, logout, updateProfile } = useUserStore();
    const { events } = useEventsStore();

    const [activeTab, setActiveTab] = useState<'eventos' | 'participacoes' | 'sobre'>('eventos');
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(width));
    const [businessState, setBusinessState] = useState({
        accountType: user?.accountType || 'personal',
        category: user?.businessCategory || '',
        address: user?.businessAddress || '',
    });

    const openMenu = () => {
        setIsMenuVisible(true);
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    };

    const closeMenu = () => {
        Animated.timing(slideAnim, { toValue: width, duration: 250, useNativeDriver: true })
            .start(() => setIsMenuVisible(false));
    };

    const userEvents = events.filter((e) => e.creatorId === user?.id || e.creatorId === '1');
    const userCommunities = MOCK_COMMUNITIES.slice(0, 4);

    const participatedEvents = events.filter(
        (e) => e.creatorId !== user?.id && e.creatorId !== '1'
    );

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                <ProfileHeader
                    user={user}
                    paddingTop={insets.top}
                    onEditPress={() => navigation.navigate('EditProfile')}
                    onMenuPress={openMenu}
                />

                <ProfileStats
                    followersCount={user?.followersCount || 0}
                    followingCount={user?.followingCount || 0}
                    eventsCount={userEvents.length}
                />

                {(user?.hostEventsCount || 0) > 0 && (
                    <View className="px-5 mt-5">
                        <HostBadge eventsCount={user?.hostEventsCount || 0} />
                    </View>
                )}

                <ProfileInterests selectedCategories={user?.selectedCategories || []} />

                <ProfileCommunities communities={userCommunities} />

                <ProfileTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    events={userEvents}
                    participatedEvents={participatedEvents}
                    bio={user?.bio || ''}
                    homeCity={user?.homeCity || ''}
                    onEventPress={(event) => navigation.navigate('EventDetail', { event })}
                />
            </ScrollView>

            <ProfileMenuDrawer
                visible={isMenuVisible}
                slideAnim={slideAnim}
                paddingTop={insets.top}
                paddingBottom={insets.bottom}
                businessState={businessState}
                onClose={closeMenu}
                onLogout={() => { closeMenu(); logout(); }}
                onSaveBusiness={() => {
                    updateProfile({
                        accountType: businessState.accountType,
                        businessCategory: businessState.category,
                        businessAddress: businessState.address,
                    });
                    closeMenu();
                }}
                onBusinessStateChange={setBusinessState}
            />
        </View>
    );
};