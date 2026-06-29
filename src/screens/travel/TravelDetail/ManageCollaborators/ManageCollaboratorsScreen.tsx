import React from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useManageCollaborators, CollaboratorUser } from '../../../../hooks/useManageCollaborators';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';
import { useAppStore } from '@/store/appStore';
import { Image } from 'expo-image';

type RowItem =
    | { kind: 'searchHeader' }
    | { kind: 'searchResult'; user: CollaboratorUser }
    | { kind: 'collabHeader' }
    | { kind: 'collabEmpty' }
    | { kind: 'collaborator'; user: CollaboratorUser };

export default function ManageCollaboratorsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { tripId } = route.params;
    const { themescolors } = useAppStore();
    const { t } = useTranslation();

    const {
        isLoading, isSaving, error, success,
        collaborators, searchQuery, setSearchQuery,
        searchResults, isSearching,
        addCollaborator, removeCollaborator, savePrivileges,
    } = useManageCollaborators(tripId);

    React.useEffect(() => {
        navigation.setOptions({
            title: t('collaborators.title'),
            headerRight: () => (
                <TouchableOpacity onPress={savePrivileges} disabled={isSaving} style={{ marginRight: 10 }}>
                    <Ionicons name="checkmark" size={24} color={themescolors.azulOscuro} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, savePrivileges, isSaving, themescolors, t]);

    React.useEffect(() => {
        if (success) navigation.goBack();
    }, [success]);

    const rows: RowItem[] = [
        ...(searchResults.length > 0
            ? [{ kind: 'searchHeader' } as RowItem, ...searchResults.map((u) => ({ kind: 'searchResult', user: u } as RowItem))]
            : []),
        { kind: 'collabHeader' },
        ...(collaborators.length === 0
            ? [{ kind: 'collabEmpty' } as RowItem]
            : collaborators.map((u) => ({ kind: 'collaborator', user: u } as RowItem))),
    ];

    if (isLoading) {
        return <View style={[styles.center, { backgroundColor: themescolors.grisFondoApp }]}><ActivityIndicator size="large" /></View>;
    }

    return (
        <View style={[styles.container, { backgroundColor: themescolors.grisFondoApp }]}>
            <View style={[styles.searchBox, { backgroundColor: themescolors.blanco, borderColor: themescolors.grisClaro }]}>
                <Ionicons name="search" size={18} color={themescolors.grisMedio} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchInput, { color: themescolors.grisOscuro }]}
                    placeholder={t('collaborators.searchPlaceholder')}
                    placeholderTextColor={themescolors.grisMedio}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {isSearching && <ActivityIndicator size="small" />}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <FlatList
                data={rows}
                keyExtractor={(item, index) =>
                    item.kind === 'searchResult' || item.kind === 'collaborator'
                        ? `${item.kind}-${item.user.id}`
                        : `${item.kind}-${index}`
                }
                renderItem={({ item }) => {
                    switch (item.kind) {
                        case 'searchHeader':
                            return <Text style={styles.sectionLabel}>{t('collaborators.resultsHeader')}</Text>;
                        case 'collabHeader':
                            return <Text style={styles.sectionLabel}>{t('collaborators.currentHeader')}</Text>;
                        case 'collabEmpty':
                            return <View style={styles.emptyBox}><Text style={{ color: '#999' }}>{t('collaborators.empty')}</Text></View>;
                        case 'searchResult':
                            return <UserRow user={item.user} onPress={() => addCollaborator(item.user)} icon="add-circle-outline" iconColor="#007AFF" themescolors={themescolors} t={t} />;
                        case 'collaborator':
                            return <UserRow user={item.user} onPress={() => removeCollaborator(item.user.id)} icon="close-circle-outline" iconColor="#FF3B30" themescolors={themescolors} t={t} />;
                        default:
                            return null;
                    }
                }}
                contentContainerStyle={{ paddingBottom: 24 }}
            />

            {isSaving && (
                <View style={styles.savingOverlay}><ActivityIndicator size="large" /></View>
            )}
        </View>
    );
}

function UserRow({ user, onPress, icon, iconColor, themescolors, t }: { user: CollaboratorUser; onPress: () => void; icon: any; iconColor: string; themescolors: any; t: (key: string) => string }) {
    const imageUrl = user.photoUrl;

    return (
        <View style={styles.userRow}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.avatar} />
            ) : (
                <View style={styles.avatar}>
                    <ImagePlaceholder currentColors={themescolors} height="100%" padding={5} />
                </View>
            )}
            <Text style={[styles.username, { color: themescolors.grisOscuro }]} numberOfLines={1}>
                {user.username ?? user.displayName ?? t('profile.defaultUsername')}
            </Text>
            <TouchableOpacity onPress={onPress}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 8 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
    searchInput: { flex: 1, fontSize: 15 },
    sectionLabel: { paddingHorizontal: 16, paddingVertical: 8, fontWeight: '600', color: '#666' },
    emptyBox: { padding: 32, alignItems: 'center' },
    userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eee', overflow: 'hidden' },
    username: { flex: 1, fontSize: 15 },
    errorText: { color: '#FF3B30', paddingHorizontal: 16, paddingBottom: 8 },
    savingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
});