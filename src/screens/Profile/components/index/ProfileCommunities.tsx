import React from 'react';
import { View, ScrollView } from 'react-native';
import { SectionHeader } from '@/src/components/SectionHeader';
import { CommunityTag } from '@/src/components/CommunityTag';

interface Community {
    id: string;
    [key: string]: any;
}

interface ProfileCommunitiesProps {
    communities: Community[];
}

export const ProfileCommunities: React.FC<ProfileCommunitiesProps> = ({ communities }) => (
    <View className="mt-6">
        <SectionHeader title="Micro comunidades" />
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
        >
            {communities.map((community) => (
                <CommunityTag key={community.id} community={community} />
            ))}
        </ScrollView>
    </View>
);