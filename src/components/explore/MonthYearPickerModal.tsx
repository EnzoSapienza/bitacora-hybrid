import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useExploreFilterStore } from "@/hooks/explore/useExploreFilterStore";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";

type Props = {
    visible: boolean;
    onClose: () => void;
};

// Mapeo de claves para i18n
export const MONTHS_KEYS = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
];

export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_YEAR = 2015;
export const MAX_YEAR = CURRENT_YEAR + 5; 

export default function MonthYearPickerModal({ visible, onClose }: Props) {
    const { user } = useAuthStore();
    const colors = useAppStore((s) => s.themescolors);
    const filters = useExploreFilterStore();
    const { t } = useTranslation();

    const [pickerYear, setPickerYear] = useState(filters.selectedYear ?? CURRENT_YEAR);
    useEffect(() => {
        if (visible) setPickerYear(filters.selectedYear ?? CURRENT_YEAR);
    }, [visible, filters.selectedYear]);

    const canGoBack = pickerYear > MIN_YEAR;
    const canGoForward = pickerYear < MAX_YEAR;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.modalSheet, { backgroundColor: colors.blanco }]} onStartShouldSetResponder={() => true}>

                    <View style={styles.yearNav}>
                        <TouchableOpacity
                            onPress={() => canGoBack && setPickerYear((y) => y - 1)}
                            style={styles.yearNavBtn}
                            disabled={!canGoBack}
                        >
                            <MaterialIcons
                                name="chevron-left"
                                size={28}
                                color={canGoBack ? colors.azulOscuro : colors.grisMedio}
                            />
                        </TouchableOpacity>

                        <Text style={[styles.yearNavText, { color: colors.azulOscuro }]}>
                            {pickerYear}
                        </Text>

                        <TouchableOpacity
                            onPress={() => canGoForward && setPickerYear((y) => y + 1)}
                            style={styles.yearNavBtn}
                            disabled={!canGoForward}
                        >
                            <MaterialIcons
                                name="chevron-right"
                                size={28}
                                color={canGoForward ? colors.azulOscuro : colors.grisMedio}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.monthColumn}>
                        {MONTHS_KEYS.map((mKey, i) => {
                            const active = filters.selectedMonth === i + 1 && filters.selectedYear === pickerYear;
                            return (
                                <TouchableOpacity
                                    key={mKey}
                                    style={[styles.monthRow, active && { backgroundColor: colors.azulProfundo + "15" }]}
                                    onPress={() => {
                                        filters.setMonthYearFilter(i + 1, pickerYear, user?.uid || "");
                                        onClose();
                                    }}
                                >
                                    <Text style={[
                                        styles.monthRowText,
                                        { color: active ? colors.azulProfundo : colors.grisOscuro },
                                        active && { fontWeight: "700" },
                                    ]}>
                                        {t(`common.months.${mKey}`)}
                                    </Text>
                                    {active && <MaterialIcons name="check" size={18} color={colors.azulProfundo} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {filters.selectedMonth != null && (
                        <TouchableOpacity
                            style={[styles.clearMonthBtn, { borderColor: colors.grisMedio }]}
                            onPress={() => {
                                filters.setMonthYearFilter(null, null, user?.uid || "");
                                onClose();
                            }}
                        >
                            <Text style={{ color: colors.grisOscuro }}>{t('explore.filters.clearMonth')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
    modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 24 },
    yearNav: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16, gap: 24 },
    yearNavBtn: { padding: 4 },
    yearNavText: { fontSize: 20, fontWeight: "700", minWidth: 60, textAlign: "center" },
    monthColumn: { marginTop: 4 },
    monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
    monthRowText: { fontSize: 15 },
    clearMonthBtn: { marginTop: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
});