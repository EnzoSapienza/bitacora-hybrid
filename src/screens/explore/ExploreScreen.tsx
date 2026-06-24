import React, { useCallback, useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDiscoveryStore } from "@/hooks/explore/useDiscoveryStore";
import { useExploreFilterStore } from "@/hooks/explore/useExploreFilterStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { useExploreFlatData } from "@/hooks/explore/useExploreFlatData";
import ExploreSearchHeader from "@/components/explore/ExploreSearchHeader";
import ExploreListItem, { FlatItem } from "@/components/explore/ExploreListItem";
import MonthYearPickerModal from "@/components/explore/MonthYearPickerModal";
import Travel from "@/types/models/travel";

export default function ExploreScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuthStore();
    const colors = useAppStore((s) => s.themescolors);

    const isLoading = useDiscoveryStore((s) => s.isLoading);
    const loadDiscoveryData = useDiscoveryStore((s) => s.loadDiscoveryData);
    const loadMoreFollowing = useDiscoveryStore((s) => s.loadMoreFollowing);

    const isFilterModeActive = useExploreFilterStore((s) => s.isFilterModeActive);
    const isSearching = useExploreFilterStore((s) => s.isSearching);
    const loadMoreFiltered = useExploreFilterStore((s) => s.loadMoreFiltered);
    const clearAll = useExploreFilterStore((s) => s.clearAll);

    const flatData = useExploreFlatData();

    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);

    const handleToggleSearch = useCallback(() => {
        setIsSearchVisible((v) => !v);
        if (isSearchVisible) clearAll();
    }, [isSearchVisible, clearAll]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleToggleSearch} style={{ marginRight: 16 }}>
                    <MaterialIcons
                        name={isSearchVisible ? "close" : "tune"}
                        size={24}
                        color={isFilterModeActive ? colors.azulProfundo : colors.grisOscuro}
                    />
                </TouchableOpacity>
            ),
        });
    }, [isFilterModeActive, isSearchVisible, handleToggleSearch]);

    useFocusEffect(
        useCallback(() => {
            if (user?.uid) loadDiscoveryData(user.uid, []);
        }, [user?.uid, loadDiscoveryData])
    );

    const handleEndReached = () => {
        if (isFilterModeActive) loadMoreFiltered();
        else loadMoreFollowing();
    };

    const handlePressTravel = (travel: Travel) => {
        navigation.navigate("PublicTravelDetail", { travelId: travel.id });
    };

    const handleSeeAllDiscovery = () => {
        navigation.navigate("AllPublicTravels");
    };

    if (isLoading) {
        return (
            <View style={[styles.centerContent, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    return (
        <>
            <FlatList<FlatItem>
                ListHeaderComponent={
                    <ExploreSearchHeader
                        visible={isSearchVisible}
                        onOpenMonthPicker={() => setIsMonthPickerVisible(true)}
                    />
                }
                data={flatData}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <ExploreListItem
                        item={item}
                        onPressTravel={handlePressTravel}
                        onPressSeeAllDiscovery={handleSeeAllDiscovery}
                    />
                )}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.4}
                style={[styles.container, { backgroundColor: colors.grisFondoApp }]}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    isSearching
                        ? <ActivityIndicator size="small" color={colors.azulProfundo} style={styles.loaderInline} />
                        : null
                }
            />
            <MonthYearPickerModal
                visible={isMonthPickerVisible}
                onClose={() => setIsMonthPickerVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { paddingBottom: 32 },
    loaderInline: { marginVertical: 16 },
    centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
});