import Travel from "@/types/models/travel";
import { Pressable, Image, StyleSheet, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { getTimeSinceText } from "../utils/date";

const styles = StyleSheet.create({
    card: {
        height: 155,
        borderRadius: 4,
        flexDirection: "row",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        padding: 12,

        elevation: 6,
    },

    image: {
        width: 120,
        height: "100%",
    },

    content: {
        flex: 1,
        paddingTop: 22,
        paddingBottom: 18,
        paddingHorizontal: 16,

        justifyContent: "space-between",
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
    },

    subtitle: {
        marginTop: 4,
        color: "#888",
        fontSize: 12,
    },

    footer: {
        flexDirection: "row",
        alignItems: "center",
    },

    bold: {
        fontWeight: "700",
    },

    normal: {
        fontWeight: "400",
    },

    topRight: {
        position: "absolute",
        top: 16,
        right: 20,

        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },

    bottomRight: {
        position: "absolute",
        right: 20,
        bottom: 20,
    },

    onCourse: {
        color: "green",
        fontWeight: "700",
    },

    finalized: {
        color: "grey",
        fontWeight: "700",
    },

    planning: {
        color: "blue",
        fontWeight: "700",
    },
});

type TravelCardProps = {
    travel: Travel;
    onPress?: () => void;
};

const TravelCard = ({ travel, onPress }: TravelCardProps) => {
    const now = new Date();

    let completion = "";
    let completionStyle = {};

    if (now < travel.startDate) {
        completion = "PLANIFICANDO";
        completionStyle = styles.planning;
    } else if (now >= travel.startDate && now <= travel.endDate) {
        completion = "EN CURSO";
        completionStyle = styles.onCourse;
    } else {
        completion = "FINALIZADO";
        completionStyle = styles.finalized;
    }

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <Image source={{ uri: travel.imageUrl || "" }} style={styles.image} />

            <View style={styles.content}>
                <View>
                    <Text style={styles.title}>{travel.name}</Text>
                    <Text style={styles.subtitle}>
                        {travel.startDate.toLocaleDateString()}
                        {" — "}
                        {travel.endDate.toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text>
                        <Text style={styles.bold}>
                            {travel.pointsCount} PUNTOS
                        </Text>

                        {!travel.updatedAt || " • ACT. " + getTimeSinceText(travel.updatedAt)}
                    </Text>
                </View>
            </View>

            <View style={styles.topRight}>
                <MaterialIcons name="visibility" size={14} />
                <Text style={completionStyle}>{completion}</Text>
            </View>

            <MaterialIcons
                name="arrow-outward"
                size={18}
                style={styles.bottomRight}
            />
        </Pressable>
    );
};

export default TravelCard;
