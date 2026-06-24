import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useExploreFilterStore } from "@/hooks/explore/useExploreFilterStore";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { MONTHS_KEYS, CURRENT_YEAR } from "@/components/explore/MonthYearPickerModal";

type Props = {
    onOpenMonthPicker: () => void;
};

export default function ExploreFilterChips({ onOpenMonthPicker }: Props) {
    const { user } = useAuthStore();
    const colors = useAppStore((s) => s.themescolors);
    const filters = useExploreFilterStore();
    const { t } = useTranslation();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
        >
            {(["short", "medium", "long"] as const).map((durKey) => {
                const durFilterVal = durKey.toUpperCase();
                const active = filters.selectedDuration === durFilterVal;
                return (
                    <TouchableOpacity
                        key={durKey}
                        style={[
                            styles.chip,
                            { borderColor: active ? colors.azulProfundo : colors.grisMedio },
                            active && { backgroundColor: colors.azulProfundo },
                        ]}
                        onPress={() => filters.toggleDurationFilter(durFilterVal, user?.uid || "")}
                    >
                        <Text style={[styles.chipText, { color: active ? colors.blanco : colors.grisOscuro }]}>
                            {t(`explore.filters.${durKey}`)}
                        </Text>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                style={[
                    styles.chip,
                    { borderColor: filters.isDetailedOnly ? colors.azulProfundo : colors.grisMedio },
                    filters.isDetailedOnly && { backgroundColor: colors.azulProfundo },
                ]}
                onPress={() => filters.toggleDetailedFilter(user?.uid || "")}
            >
                <MaterialIcons
                    name="place"
                    size={14}
                    color={filters.isDetailedOnly ? colors.blanco : colors.grisOscuro}
                    style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, { color: filters.isDetailedOnly ? colors.blanco : colors.grisOscuro }]}>
                    {t('explore.filters.detailed')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.chip,
                    { borderColor: filters.selectedMonth != null ? colors.azulProfundo : colors.grisMedio },
                    filters.selectedMonth != null && { backgroundColor: colors.azulProfundo },
                ]}
                onPress={onOpenMonthPicker}
            >
                <MaterialIcons
                    name="calendar-today"
                    size={14}
                    color={filters.selectedMonth != null ? colors.blanco : colors.grisOscuro}
                    style={{ marginRight: 4 }}
                />
                <Text style={[styles.chipText, { color: filters.selectedMonth != null ? colors.blanco : colors.grisOscuro }]}>
                    {filters.selectedMonth != null
                        ? `${t(`common.months.${MONTHS_KEYS[filters.selectedMonth - 1]}`)} ${filters.selectedYear ?? CURRENT_YEAR}`
                        : t('explore.filters.monthYear')}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    chipsScroll: { marginBottom: 8 },
    chipsContent: { gap: 8, paddingRight: 16 },
    chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    chipText: { fontSize: 13, fontWeight: "500" },
});