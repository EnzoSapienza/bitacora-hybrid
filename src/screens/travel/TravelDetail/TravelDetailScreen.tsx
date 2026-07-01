import React, { useEffect, useState } from "react"; // 1. Agregamos useState
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTravelStore } from "@/hooks/firestore/useTravelStore";
import { usePoiStore } from "@/hooks/firestore/usePoiStore";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/firestore/userService";
import { Typography } from "@/constants/typography";
import { TravelStackParamList } from "@/navigation/tabs/TravelNavigator";
import { TravelDetailContent } from "./TravelDetailContent";

type DetailRouteProp = RouteProp<TravelStackParamList, "TravelDetails">;
type DetailNavProp = NativeStackNavigationProp<TravelStackParamList>;

export default function TravelDetailScreen() {
    const route = useRoute<DetailRouteProp>();
    const navigation = useNavigation<DetailNavProp>();
    const { travelId } = route.params;
    const colors = useAppStore((s) => s.themescolors);
    const currentUser = useAuthStore((s) => s.user);
    const { t } = useTranslation();

    const travel = useTravelStore(
        (state) =>
            state.travels.find((t) => t.id === travelId) ||
            state.sharedTravels.find((t) => t.id === travelId),
    );
    const { points, loading, fetchPoints } = usePoiStore();

    const [creatorUser, setCreatorUser] = useState<any | null>(null);
    const isMyTravel = travel?.ownerId === currentUser?.uid;

    useEffect(() => {
        if (travelId) fetchPoints(travelId);

        if (travel?.ownerId && !isMyTravel) {
            userService.getPublicProfile(travel.ownerId).then((data) => {
                setCreatorUser(data);
            });
        }
    }, [travelId, travel?.ownerId, isMyTravel]);

    useEffect(() => {
        navigation.setOptions({
            title: travel?.name || t("explore.nav.travelDetail"),
            headerRight: () =>
                currentUser?.uid === travel?.ownerId ? (
                    <>
                        <TouchableOpacity
                            style={{ marginRight: 10 }}
                            onPress={() =>
                                navigation.navigate("ManageCollaborators", {
                                    tripId: travel!.id,
                                })
                            }
                        >
                            <MaterialIcons
                                name="group-add"
                                size={24}
                                color={colors.grisOscuro}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginRight: 10 }}
                            onPress={() =>
                                navigation.navigate("TravelEdit", {
                                    travelId: travel!.id,
                                })
                            }
                        >
                            <MaterialIcons
                                name="edit"
                                size={24}
                                color={colors.grisOscuro}
                            />
                        </TouchableOpacity>
                    </>
                ) : null,
        });
    }, [travel, currentUser, colors, navigation, t]);

    if (!travel) {
        return (
            <View
                style={[
                    styles.center,
                    { backgroundColor: colors.grisFondoApp },
                ]}
            >
                <Text
                    style={[Typography.bodyLarge, { color: colors.grisOscuro }]}
                >
                    {t("travel.notFound")}
                </Text>
            </View>
        );
    }

    return (
        <TravelDetailContent
            travel={travel}
            points={points}
            poisLoading={loading}
            onPoiPress={(item) =>
                navigation.navigate("PoiDetail", {
                    pointId: item.id,
                    travelId: travel.id,
                })
            }
            onAddPoi={() =>
                navigation.navigate("PointForm", { travelId: travel.id })
            }
            creatorUser={!isMyTravel ? creatorUser : null}
            onCreatorPress={
                !isMyTravel
                    ? () =>
                          navigation.navigate("PublicProfile", {
                              userId: travel.ownerId,
                          })
                    : undefined
            }
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
