import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';

type Props = {
    displayName?: string;
    username?: string;
    bio?: string;
    photoUrl?: string;
    travelCount?: number;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    onFollowToggle?: () => void;
};

export const ProfileHeader = ({
    displayName, username, bio, photoUrl,
    travelCount = 0, followersCount = 0, followingCount = 0,
    isFollowing, onFollowToggle,
}: Props) => {
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();

    return (
        <View style={[styles.container, { borderBottomColor: colors.grisClaro }]}>
            <View style={styles.topRow}>
                {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.grisClaro }]}>
                        <MaterialIcons name="person" size={36} color={colors.grisMedio} />
                    </View>
                )}

                <View style={styles.info}>
                    <Text style={[Typography.titleMedium, { color: colors.grisOscuro, fontWeight: '700', fontSize: 20 }]}>
                        {displayName ?? t('profile.loading')}
                    </Text>
                    <Text style={[Typography.bodyMedium, { color: colors.grisMedio }]}>
                        @{username ?? t('profile.defaultUsername')}
                    </Text>
                    {bio ? (
                        <Text style={[Typography.labelSmall, { color: colors.grisOscuro, fontStyle: 'italic', marginTop: 2 }]}>
                            {bio}
                        </Text>
                    ) : null}
                </View>
            </View>

            <View style={styles.countersRow}>
                <CounterItem icon="travel-explore" count={travelCount} label={t('profile.trips')} color={colors.azulProfundo} />
                <CounterItem icon="people" count={followersCount} label={t('profile.followers')} color={colors.azulProfundo} />
                <CounterItem icon="person-add" count={followingCount} label={t('profile.following')} color={colors.azulProfundo} />
            </View>

            {onFollowToggle && (
                <TouchableOpacity
                    style={[styles.followButton, isFollowing && { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.azulProfundo }]}
                    onPress={onFollowToggle}
                >
                    <Text style={[styles.followButtonText, isFollowing && { color: colors.azulProfundo }]}>
                        {isFollowing ? t('profile.following') : t('profile.follow')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

type CounterProps = {
    icon: any;
    count: number;
    label: string;
    color: string;
};

const CounterItem = ({ icon, count, label, color }: CounterProps) => (
    <View style={styles.counterItem}>
        <MaterialIcons name={icon} size={22} color={color} />
        <Text style={[styles.counterCount, { color }]}>{count}</Text>
        <Text style={styles.counterLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1 },
    topRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 72, height: 72, borderRadius: 36 },
    avatarFallback: { justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, marginLeft: 16 },
    countersRow: { flexDirection: 'row', gap: 24, marginTop: 16 },
    counterItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    counterCount: { fontWeight: '700', fontSize: 16 },
    counterLabel: { fontSize: 13, color: '#999' },
    followButton: {
        alignSelf: 'flex-end',
        marginTop: 16,
        paddingHorizontal: 32,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#007BFF'
    },
    followButtonText: { color: '#fff', fontWeight: 'bold' },
});