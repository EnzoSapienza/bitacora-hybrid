import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import ExploreScreen from "@/screens/explore/ExploreScreen";
import PublicTravelDetailScreen from "../../screens/explore/PublicTravelDetailScreen";
import PublicProfileScreen from "../../screens/explore/PublicProfileScreen";
import PublicPointDetailScreen from "../../screens/explore/PublicPointDetailScreen";
import AllPublicTravelsScreen from "../../screens/explore/AllPublicTravelsScreen";

export type ExploreStackParamList = {
    ExploreMain: undefined;
    PublicTravelDetail: { travelId: string };
    PublicProfile: { userId: string };
    PublicPointDetail: { travelId: string; pointId: string };
    AllPublicTravels: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreNavigator() {
    const { t } = useTranslation();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ExploreMain"
                component={ExploreScreen}
                options={{
                    title: t("explore.title") || "Explorar",
                    headerShown: true,
                }}
            />
            <Stack.Screen
                name="PublicTravelDetail"
                component={PublicTravelDetailScreen}
                options={{ title: t("explore.nav.travelDetail") || "Detalle del Viaje" }}
            />
            <Stack.Screen
                name="PublicProfile"
                component={PublicProfileScreen}
                options={{ title: t("explore.nav.profile") || "Perfil del Viajero" }}
            />
            <Stack.Screen
                name="PublicPointDetail"
                component={PublicPointDetailScreen}
                options={{ title: t("explore.nav.poi") || "Punto de Interés" }}
            />
            <Stack.Screen
                name="AllPublicTravels"
                component={AllPublicTravelsScreen}
                options={{ title: t("explore.nav.allTravels") || "Descubrir Viajes" }}
            />
        </Stack.Navigator>
    );
}