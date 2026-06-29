import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, FlatList, Text } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next'; // 1. Importar useTranslation
import { ExploreStackParamList } from '../../navigation/tabs/ExploreNavigator';
import { usePublicProfileStore } from '@/hooks/explore/usePublicProfileStore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import TravelCard from '@/components/travel/travel_card/TravelCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';

type ProfileRouteProp = RouteProp<ExploreStackParamList, 'PublicProfile'>;
type ExploreNavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'PublicProfile'>;

export default function PublicProfileScreen() {
    const route = useRoute<ProfileRouteProp>();
    const navigation = useNavigation<ExploreNavigationProp>();
    const { userId } = route.params;
    const store = usePublicProfileStore();
    const { user: currentUser } = useAuthStore();
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation(); // 2. Inicializar el hook

    useEffect(() => {
        if (userId) store.loadProfile(userId, currentUser?.uid);
        return () => store.clearProfile();
    }, [userId]);

    if (store.isLoading || !store.user) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    const isMe = currentUser?.uid === userId;
    const { user: profileUser, travels, isFollowing } = store;

    const renderHeader = () => (
        <View>
            <ProfileHeader
                displayName={profileUser.nombre}
                username={profileUser.username}
                bio={profileUser.bio}
                photoUrl={profileUser.photoUrl}
                travelCount={travels.length}
                followersCount={profileUser.followersCount}
                followingCount={profileUser.followingCount}
                isFollowing={isMe ? undefined : isFollowing}
                onFollowToggle={isMe ? undefined : () => store.toggleFollow(userId, currentUser?.uid || '')}
            />
            <View style={styles.content}>
                <Text style={[{ fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: colors.grisOscuro }]}>
                    {t('profile.trips')}
                </Text>
            </View>
        </View>
    );

    return (
        <FlatList
            data={travels}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
                <View style={{ paddingHorizontal: 16 }}>
                    <TravelCard 
                        travel={item} 
                        onPress={() => navigation.push('PublicTravelDetail', { travelId: item.id })} 
                    />
                </View>
            )}
            style={[styles.container, { backgroundColor: colors.grisFondoApp }]}
            contentContainerStyle={{ paddingBottom: 40 }}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 0
    },
});