import { useEffect, useState } from 'react';
import { useEventsStore } from '../store/useEventsStore';
import { useCommunityStore } from '../store/useCommunityStore';
import { useActivityFeedStore } from '../store/useActivityFeedStore';

export function useAppInit() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { fetchEvents } = useEventsStore();
    const { fetchCommunities } = useCommunityStore();
    const { fetchActivities } = useActivityFeedStore();

    useEffect(() => {
        Promise.allSettled([
            fetchEvents(),
            fetchCommunities(),
            fetchActivities ? fetchActivities() : Promise.resolve(),
        ])
            .catch((e) => setError(String(e)))
            .finally(() => setIsLoading(false));
    }, []);

    return { isLoading, error };
}
