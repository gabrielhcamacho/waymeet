import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import { WelcomeScreen } from '../screens/Auth/WelcomeScreen';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { SelectCategoriesScreen } from '../screens/Onboarding/SelectCategoriesScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { ExploreFiltersModal } from '../screens/Home/ExploreFiltersModal';
import { MapScreen } from '../screens/Map/MapScreen';
import { CreateEventModal } from '../screens/Map/CreateEventModal';
import { EventDetailScreen } from '../screens/Events/EventDetailScreen';
import { ChatScreen } from '../screens/Chat/ChatScreen';
import { CommunityScreen } from '../screens/Community/CommunityScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { EditProfileScreen } from '../screens/Profile/EditProfileScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { useUserStore } from '../store/useUserStore';
import { Colors } from '../config/theme';
import { AppHeader } from '../components/AppHeader';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MapStack = createNativeStackNavigator();
const CommunityStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackScreen = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: true, header: () => <AppHeader /> }}>
        <HomeStack.Screen name="HomeMain" component={HomeScreen} />
        <HomeStack.Screen name="ExploreFilters" component={ExploreFiltersModal}
            options={{ presentation: 'modal' }} />
        <HomeStack.Screen name="EventDetail" component={EventDetailScreen} />
        <HomeStack.Screen name="Chat" component={ChatScreen} />
    </HomeStack.Navigator>
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

const CommunityStackScreen = () => (
    <CommunityStack.Navigator screenOptions={{ headerShown: true, header: () => <AppHeader /> }}>
        <CommunityStack.Screen name="Comunidade" component={CommunityScreen} />
        <CommunityStack.Screen name="EventDetail" component={EventDetailScreen} />
        <CommunityStack.Screen name="Chat" component={ChatScreen} />
    </CommunityStack.Navigator>
);

const ProfileStackScreen = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: true }}>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
        <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
        <ProfileStack.Screen name="EventDetail" component={EventDetailScreen} />
        <ProfileStack.Screen name="Chat" component={ChatScreen} />
    </ProfileStack.Navigator>
);

const MainTabs = () => (
    <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
    >
        <Tab.Screen name="ExploreTab" component={HomeStackScreen} />
        <Tab.Screen name="MapTab" component={MapStackScreen} />
        <Tab.Screen name="CommunityTab" component={CommunityStackScreen} />
        <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
    </Tab.Navigator>
);

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
