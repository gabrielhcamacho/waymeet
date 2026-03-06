import { create } from 'zustand';
import { User, AuthStatus } from '../types';
import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserStore {
    user: User | null;
    authStatus: AuthStatus;
    hasCompletedOnboarding: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string) => Promise<void>;
    socialLogin: (provider: 'google' | 'apple') => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: (updates: Partial<User>) => void;
    setSelectedCategories: (categories: string[]) => void;
    completeOnboarding: () => void;
    deleteAccount: () => Promise<void>;
    checkSession: () => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
}

/**
 * Converte os dados do Supabase Auth em um objeto User do app.
 */
const mapSupabaseUser = (supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
    created_at?: string;
    email_confirmed_at?: string | null;
}): User => {
    const meta = supabaseUser.user_metadata || {};
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        displayName: meta.display_name || meta.full_name || '',
        avatarUrl: meta.avatar_url || '',
        coverPhotoUrl: meta.cover_photo_url || '',
        homeCity: meta.home_city || '',
        bio: meta.bio || '',
        selectedCategories: meta.selected_categories || [],
        followersCount: 0,
        followingCount: 0,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        emailVerified: !!supabaseUser.email_confirmed_at,
        gdprConsent: meta.gdpr_consent || false,
    };
};

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    authStatus: 'idle',
    hasCompletedOnboarding: false,

    login: async (email: string, password: string) => {
        set({ authStatus: 'loading' });
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            set({ authStatus: 'unauthenticated' });
            throw new Error(error.message);
        }

        const user = mapSupabaseUser(data.user);
        const onboarded = await AsyncStorage.getItem('onboarding_complete');
        set({
            user,
            authStatus: 'authenticated',
            hasCompletedOnboarding: onboarded === 'true',
        });
    },

    signup: async (email: string, password: string, displayName: string) => {
        set({ authStatus: 'loading' });
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
            },
        });

        if (error) {
            set({ authStatus: 'unauthenticated' });
            throw new Error(error.message);
        }

        if (data.user) {
            const user = mapSupabaseUser(data.user);
            set({
                user,
                authStatus: 'authenticated',
                hasCompletedOnboarding: false,
            });
        }
    },

    socialLogin: async (_provider: 'google' | 'apple') => {
        // Social login com Supabase requer configuração OAuth no dashboard.
        // Por enquanto, mantém placeholder — a integração completa
        // requer expo-auth-session ou expo-web-browser.
        set({ authStatus: 'loading' });
        // TODO: Implementar OAuth flow com supabase.auth.signInWithOAuth
        set({ authStatus: 'unauthenticated' });
        throw new Error(
            'Login social ainda não configurado. ' +
            'Configure o provider OAuth no Supabase Dashboard.'
        );
    },

    logout: async () => {
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('onboarding_complete');
        set({ user: null, authStatus: 'unauthenticated', hasCompletedOnboarding: false });
    },

    resetPassword: async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            throw new Error(error.message);
        }
    },

    updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
            set({ user: { ...user, ...updates } });

            // Atualiza os metadados no Supabase de forma assíncrona
            supabase.auth.updateUser({
                data: {
                    display_name: updates.displayName,
                    avatar_url: updates.avatarUrl,
                    cover_photo_url: updates.coverPhotoUrl,
                    home_city: updates.homeCity,
                    bio: updates.bio,
                    selected_categories: updates.selectedCategories,
                },
            });
        }
    },

    setSelectedCategories: (categories: string[]) => {
        const { user } = get();
        if (user) {
            set({ user: { ...user, selectedCategories: categories } });
            supabase.auth.updateUser({
                data: { selected_categories: categories },
            });
        }
    },

    completeOnboarding: () => {
        AsyncStorage.setItem('onboarding_complete', 'true');
        set({ hasCompletedOnboarding: true });
    },

    deleteAccount: async () => {
        // Nota: deletar conta pelo client requer uma Edge Function ou
        // usar supabase.auth.admin.deleteUser no backend.
        // Aqui fazemos o sign out e limpamos os dados locais.
        await supabase.auth.signOut();
        await AsyncStorage.removeItem('onboarding_complete');
        set({ user: null, authStatus: 'unauthenticated', hasCompletedOnboarding: false });
    },

    checkSession: async () => {
        set({ authStatus: 'loading' });
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                set({ authStatus: 'unauthenticated' });
                return;
            }

            const user = mapSupabaseUser(session.user);
            const onboarded = await AsyncStorage.getItem('onboarding_complete');
            set({
                user,
                authStatus: 'authenticated',
                hasCompletedOnboarding: onboarded === 'true',
            });
        } catch {
            set({ authStatus: 'unauthenticated' });
        }
    },

    resendVerificationEmail: async () => {
        const { user } = get();
        if (user?.email) {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email,
            });
            if (error) {
                throw new Error(error.message);
            }
        }
    },
}));
