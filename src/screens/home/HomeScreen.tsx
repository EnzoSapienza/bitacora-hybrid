import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import TravelList from "@/components/travel/travel_list/TravelList";
import { useTravelStore } from "@/hooks/firestore/useTravelStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import AddButton from "@/components/add_button/AddButton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

export default function HomeScreen() {
    const [tab, setTab] = useState<'mine' | 'shared'>('mine');
    const navigation = useNavigation<any>();
    const { user, loadProfile } = useAuthStore();
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();

    const { travels, sharedTravels, loading, sharedLoading, fetchTravels, fetchSharedTravels } = useTravelStore();

    useEffect(() => {
        if (user?.uid) {
            fetchTravels(user.uid);
            fetchSharedTravels(user.uid);
            if (!user.nombre) {
                loadProfile(user.uid);
            }
        }
    }, [user?.uid]);

    // Filtrar la lista a mostrar segun la pestaña activa
    const displayedTravels = tab === 'mine' ? travels : sharedTravels;
    const isCurrentlyLoading = loading || sharedLoading;

    if (isCurrentlyLoading && travels.length === 0 && sharedTravels.length === 0) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.grisFondoApp }]}>
            <ProfileHeader
                displayName={user?.nombre}
                username={user?.username}
                bio={user?.bio}
                photoUrl={user?.photoUrl}
                travelCount={travels.length}
                followersCount={user?.followersCount}
                followingCount={user?.followingCount}
            />

            {/* Selector de Pestañas */}
            <View style={[styles.tabContainer, { borderBottomColor: colors.grisClaro }]}>
                <TouchableOpacity 
                    onPress={() => setTab('mine')} 
                    style={[styles.tab, tab === 'mine' && { borderBottomWidth: 2, borderBottomColor: colors.azulProfundo }]}
                >
                    <Text style={[styles.tabText, { color: tab === 'mine' ? colors.azulProfundo : colors.grisMedio }, tab === 'mine' && styles.activeTabText]}>
                        {t('home.tabs.mine')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setTab('shared')} 
                    style={[styles.tab, tab === 'shared' && { borderBottomWidth: 2, borderBottomColor: colors.azulProfundo }]}
                >
                    <Text style={[styles.tabText, { color: tab === 'shared' ? colors.azulProfundo : colors.grisMedio }, tab === 'shared' && styles.activeTabText]}>
                        {t('home.tabs.shared')}
                    </Text>
                </TouchableOpacity>
            </View>

            <TravelList
                travels={displayedTravels}
                onPressItem={(item) =>
                    navigation.navigate("Travel", {
                        screen: "TravelDetails",
                        params: { travelId: item.id }
                    })
                }
            />
            <AddButton
                onPress={() => navigation.navigate("Travel", { screen: "TravelForm" })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    tabContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: 20, 
        marginTop: 10,
        borderBottomWidth: 1,
    },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
    tabText: { },
    activeTabText: { fontWeight: 'bold' }
});