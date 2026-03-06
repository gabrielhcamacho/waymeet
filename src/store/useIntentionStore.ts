import { create } from 'zustand';
import { SocialIntention } from '../types';
import { MOCK_INTENTIONS } from '../data/mockData';

interface IntentionStore {
    activeIntention: SocialIntention | null;
    expiresAt: string | null;
    availableIntentions: SocialIntention[];

    setIntention: (intention: SocialIntention | null) => void;
    clearIntention: () => void;
    isExpired: () => boolean;
}

const INTENTION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

export const useIntentionStore = create<IntentionStore>((set, get) => ({
    activeIntention: null,
    expiresAt: null,
    availableIntentions: MOCK_INTENTIONS,

    setIntention: (intention) => {
        if (intention) {
            set({
                activeIntention: intention,
                expiresAt: new Date(Date.now() + INTENTION_DURATION_MS).toISOString(),
            });
        } else {
            set({ activeIntention: null, expiresAt: null });
        }
    },

    clearIntention: () => {
        set({ activeIntention: null, expiresAt: null });
    },

    isExpired: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;
        return new Date(expiresAt).getTime() < Date.now();
    },
}));
