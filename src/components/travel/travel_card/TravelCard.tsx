import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Travel from "@/types/models/travel";
import { useAppStore } from "@/store/appStore";
import { Typography } from "@/constants/typography";
import { formatDateLocalized, getTimeSinceText, getTravelStatus } from "@/components/utils/date";
import ImagePlaceholder from "@/components/common/ImagePlaceholder";

type TravelCardProps = {
    travel: Travel;
    onPress?: () => void;
};

const TravelCard = ({ travel, onPress }: TravelCardProps) => {
    const colors = useAppStore((s) => s.themescolors);
    const { t, i18n } = useTranslation();

    const status = getTravelStatus(travel.startDate, travel.endDate, colors, t);

    const getVisibilityIcon = (vis: string) => {
        switch (vis?.toLowerCase()) {
            case "public": return "public";
            case "followers": return "people";
            default: return "lock";
        }
    };

    return (
        <Pressable 
            style={({ pressed }) => [
                styles.card, 
                { backgroundColor: colors.blanco, borderColor: colors.grisClaro, opacity: pressed ? 0.98 : 1 }
            ]} 
            onPress={onPress}
        >
            <View style={styles.imageContainer}>
                {travel.imageUrl ? (
                    <Image source={{ uri: travel.imageUrl }} style={styles.image} contentFit="cover" transition={150} />
                ) : (
                    <ImagePlaceholder currentColors={colors} padding={20} />
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.middleSection}>
                    <Text style={[Typography.titleMedium, styles.title, { color: colors.grisOscuro }]} numberOfLines={1}>
                        {travel.name}
                    </Text>
                    <Text style={[Typography.bodyMedium, { color: colors.grisMedio, marginTop: 4 }]}>
                        {formatDateLocalized(travel.startDate, i18n.language)} — {formatDateLocalized(travel.endDate, i18n.language)}
                    </Text>
                </View>

                <View style={styles.footerContainer}>
                    <View style={styles.infoGroup}>
                        <MaterialIcons name="place" size={14} color={colors.azulProfundo} />
                        <Text style={[Typography.labelSmall, { color: colors.grisOscuro, fontWeight: "700" }]}>
                            {travel.pointsCount} {t("travel.points", { count: travel.pointsCount })}
                        </Text>
                    </View>

                    {travel.updatedAt && (
                        <View style={styles.updateRow}>
                            <MaterialIcons name="sync" size={14} color={colors.grisMedio} style={{ marginRight: 4 }} />
                            <Text style={[Typography.labelSmall, { color: colors.grisMedio, fontSize: 11 }]} numberOfLines={1}>
                                {t("travel.updatedPrefix")} {getTimeSinceText(travel.updatedAt, i18n.language)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.topRight}>
                <MaterialIcons name={getVisibilityIcon(travel.visibility)} size={14} color={colors.grisMedio} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>

            <MaterialIcons
                name="arrow-outward"
                size={18}
                color={colors.grisMedio}
                style={styles.bottomRight}
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        height: 155,
        borderRadius: 20,
        flexDirection: "row",
        borderWidth: 1,
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
        elevation: 3,
    },
    imageContainer: { 
        width: 125, 
        height: "100%" 
    },
    image: { 
        width: "100%", 
        height: "100%" 
    },
    content: {
        flex: 1,
        padding: 16,
        justifyContent: "space-between",
    },
    topRight: {
        position: "absolute",
        top: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    statusText: {
        fontWeight: "700",
        fontSize: 12,
    },
    middleSection: {
        flex: 1,
        justifyContent: "center",
        marginTop: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        width: "100%",
        paddingRight: 24,
    },
    footerContainer: {
        gap: 4,
        paddingRight: 35,
    },
    infoGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    updateRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 4,
    },
    bottomRight: {
        position: "absolute",
        right: 16,
        bottom: 16,
    },
});

export default TravelCard;