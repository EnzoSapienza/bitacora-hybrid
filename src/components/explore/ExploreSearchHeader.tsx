import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useExploreFilterStore } from "@/hooks/explore/useExploreFilterStore";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import ExploreFilterChips from "./ExploreFilterChips";

type Props = {
    visible: boolean;
    onOpenMonthPicker: () => void;
};

export default function ExploreSearchHeader({ visible, onOpenMonthPicker }: Props) {
    const { user } = useAuthStore();
    const colors = useAppStore((s) => s.themescolors);
    const filters = useExploreFilterStore();
    const { t } = useTranslation();

    return (
        <View>
            {visible && (
                <View style={styles.filtersContainer}>
                    <View style={[styles.searchRow, { backgroundColor: colors.blanco }]}>
                        <MaterialIcons name="search" size={24} color={colors.grisMedio} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.azulOscuro }]}
                            placeholder={t('explore.searchPlaceholder')}
                            placeholderTextColor={colors.grisMedio}
                            value={filters.searchQuery}
                            onChangeText={(text) => filters.setSearchQuery(text, user?.uid || "")}
                        />
                        {filters.searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => filters.setSearchQuery("", user?.uid || "")}>
                                <MaterialIcons name="close" size={18} color={colors.grisMedio} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <ExploreFilterChips onOpenMonthPicker={onOpenMonthPicker} />
                </View>
            )}
            <View style={[styles.divider, { backgroundColor: colors.grisMedio + "30" }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    filtersContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    searchRow: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 12, height: 40, marginBottom: 12 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
    divider: { height: 1 },
});