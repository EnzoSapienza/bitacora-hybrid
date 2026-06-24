import React from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppStore } from "@/store/appStore";
import TravelCard from "@/components/travel/travel_card/TravelCard";
import Travel from "@/types/models/travel";
import { useTranslation } from "react-i18next";

export type FlatItem =
    | { kind: "section_header"; title: string; key: string }
    | { kind: "travel"; travel: Travel; key: string }
    | { kind: "loader"; key: string }
    | { kind: "empty"; message: string; key: string };

type Props = {
    item: FlatItem;
    onPressTravel: (travel: Travel) => void;
    onPressSeeAllDiscovery?: () => void;
};

export default function ExploreListItem({ item, onPressTravel, onPressSeeAllDiscovery }: Props) {
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation()

    if (item.kind === "section_header") {
        const isDiscoveryHeader = item.key === "header_discovery" && onPressSeeAllDiscovery;

        if (isDiscoveryHeader) {
            return (
                <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: colors.azulOscuro, marginBottom: 0, paddingHorizontal: 0 }]}>
                        {item.title}
                    </Text>
                    <TouchableOpacity style={styles.seeAllRow} onPress={onPressSeeAllDiscovery}>
                        <Text style={[styles.seeAllText, { color: colors.azulProfundo }]}>{t('explore.sections.seeAll')}</Text>
                        <MaterialIcons name="chevron-right" size={18} color={colors.azulProfundo} />
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <Text style={[styles.sectionTitle, { color: colors.azulOscuro }]}>
                {item.title}
            </Text>
        );
    }

    if (item.kind === "travel") {
        return (
            <View style={styles.cardWrapper}>
                <TravelCard travel={item.travel} onPress={() => onPressTravel(item.travel)} />
            </View>
        );
    }

    if (item.kind === "loader") {
        return <ActivityIndicator size="small" color={colors.azulProfundo} style={styles.loaderInline} />;
    }

    if (item.kind === "empty") {
        return (
            <Text style={[styles.emptyText, { color: colors.grisMedio }]}>
                {item.message}
            </Text>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, marginTop: 20, paddingHorizontal: 16 },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    seeAllRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingLeft: 8 },
    seeAllText: { fontSize: 13, fontWeight: "600", marginRight: 2 },
    cardWrapper: { paddingHorizontal: 16 },
    loaderInline: { marginVertical: 16 },
    emptyText: { fontSize: 14, textAlign: "center", paddingVertical: 16, paddingHorizontal: 16 },
});