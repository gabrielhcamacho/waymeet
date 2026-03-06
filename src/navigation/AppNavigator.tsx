import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { SelectCategoriesScreen } from '../screens/Onboarding/SelectCategoriesScreen';
import { RadarScreen } from '../screens/Radar/RadarScreen';
import { MapScreen } from '../screens/Map/MapScreen';
import { CreateEventModal } from '../screens/Map/CreateEventModal';
import { AgoraScreen } from '../screens/Agora/AgoraScreen';
import { ActivityDetailScreen } from '../screens/Agora/ActivityDetailScreen';
import { QuickCreateModal } from '../screens/Agora/QuickCreateModal';
import { ExploreScreen } from '../screens/Explore/ExploreScreen';
import { RouteDetailScreen } from '../screens/Explore/RouteDetailScreen';
import { PlaceDetailScreen } from '../screens/Explore/PlaceDetailScreen';
import { CommunityScreen } from '../screens/Community/CommunityScreen';
import { CommunityDetailScreen } from '../screens/Community/CommunityDetailScreen';
import { EventDetailScreen } from '../screens/Events/EventDetailScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { useUserStore } from '../store/useUserStore';
import { usePresenceStore } from '../store/usePresenceStore';
import { useActivityFeedStore } from '../store/useActivityFeedStore';
import { AppHeader } from '../components/AppHeader';
import { MOCK_PRESENCE_USERS, MOCK_ACTIVITY_FEED } from '../data/mockData';
import { locationService } from '../services/locationService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const RadarStack = createNativeStackNavigator();
const MapStack = createNativeStackNavigator();
const AgoraStack = createNativeStackNavigator();
const ExploreStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const RadarStackScreen = () => (
    <RadarStack.Navigator screenOptions={{ headerShown: true, header: () => <AppHeader /> }}>
        <RadarStack.Screen name="RadarMain" component={RadarScreen} />
        <RadarStack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
        <RadarStack.Screen name="CommunityDetail" component={CommunityDetailScreen} options={{ headerShown: false }} />
        <RadarStack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
    </RadarStack.Navigator>
);

const MapStackScreen = () => (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
        <MapStack.Screen name="MapMain" component={MapScreen} />
        <MapStack.Screen name="CreateEvent" component={CreateEventModal}
            options={{ presentation: 'modal' }} />
        <MapStack.Screen name="EventDetail" component={EventDetailScreen} />
        <MapStack.Screen name="Chat" component={ChatScreen} />
    </MapStack.Navigator>
);

const AgoraStackScreen = () => (
    <AgoraStack.Navigator screenOptions={{ headerShown: false }}>
        <AgoraStack.Screen name="AgoraMain" component={AgoraScreen} />
        <AgoraStack.Screen name="QuickCreate" component={QuickCreateModal}
            options={{ presentation: 'modal' }} />
        <AgoraStack.Screen name="EventDetail" component={EventDetailScreen} />
        <AgoraStack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
        <AgoraStack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
        <AgoraStack.Screen name="Chat" component={ChatScreen} />
    </AgoraStack.Navigator>
);

const ExploreStackScreen = () => (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
        <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} />
        <ExploreStack.Screen name="RouteDetail" component={RouteDetailScreen} />
        <ExploreStack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
        <ExploreStack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
        <ExploreStack.Screen name="Comunidade" component={CommunityScreen} />
        <ExploreStack.Screen name="EventDetail" component={EventDetailScreen} />
        <ExploreStack.Screen name="Chat" component={ChatScreen} />
    </ExploreStack.Navigator>
);

const ProfileStackScreen = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
        <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
        <ProfileStack.Screen name="EventDetail" component={EventDetailScreen} />
        <ProfileStack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
        <ProfileStack.Screen name="Chat" component={ChatScreen} />
    </ProfileStack.Navigator>
);

const MainTabs = () => {
    const { heartbeat, setActiveUsers } = usePresenceStore();
    const { setActivities } = useActivityFeedStore();

    useEffect(() => {
        // Initialize mock data
        setActiveUsers(MOCK_PRESENCE_USERS);
        setActivities(MOCK_ACTIVITY_FEED);

        // Heartbeat: update presence every 30s
        const interval = setInterval(async () => {
            try {
                const loc = await locationService.getCurrentLocation();
                heartbeat(loc.latitude, loc.longitude);
            } catch { /* location unavailable */ }
        }, 30 * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="RadarTab" component={RadarStackScreen} />
            <Tab.Screen name="MapTab" component={MapStackScreen} />
            <Tab.Screen name="AgoraTab" component={AgoraStackScreen} />
            <Tab.Screen name="ExploreTab" component={ExploreStackScreen} />
            <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
        </Tab.Navigator>
    );
};

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
);

const OnboardingStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SelectCategories" component={SelectCategoriesScreen} />
    </Stack.Navigator>
);

export const AppNavigator: React.FC = () => {
    const { authStatus, hasCompletedOnboarding } = useUserStore();

    return (
        <NavigationContainer>
            {authStatus !== 'authenticated' ? (
                <AuthStack />
            ) : !hasCompletedOnboarding ? (
                <OnboardingStack />
            ) : (
                <MainTabs />
            )}
        </NavigationContainer>
    );
};
