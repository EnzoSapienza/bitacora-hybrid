import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TravelDetailScreen from "@/screens/travel/TravelDetail/TravelDetailScreen";
import TravelFormScreen from "@/screens/travel/TravelForm/TravelFormScreen";
import PointFormScreen from "@/screens/travel/PointForm/PointFormScreen";
import PointOfInterestScreen from "@/screens/travel/PointOfInterestScreen/PointOfInterestScreen";
import ManageCollaboratorsScreen from "@/screens/travel/TravelDetail/ManageCollaborators/ManageCollaboratorsScreen";
import PublicProfileScreen from "@/screens/explore/PublicProfileScreen";
import PublicTravelDetailScreen from "@/screens/explore/PublicTravelDetailScreen";
import PublicPointDetailScreen from "@/screens/explore/PublicPointDetailScreen";
import { useTranslation } from "react-i18next";

export type TravelStackParamList = {
    TravelDetails: { travelId: string };
    TravelForm: undefined;
    PoiDetail: { pointId: string; travelId: string };
    PointForm: { travelId: string };
    ManageCollaborators: { tripId: string };
    PublicProfile: { userId: string };
    PublicTravelDetail: { travelId: string };
    PublicPointDetail: { travelId: string; pointId: string };
};

const Stack = createNativeStackNavigator<TravelStackParamList>();

export default function TravelNavigator() {
    const { t } = useTranslation();
    return (
        <Stack.Navigator>
            <Stack.Screen name="TravelDetails" component={TravelDetailScreen} />
            <Stack.Screen
                name="TravelForm"
                component={TravelFormScreen}
                options={{ title: t("travel.form.title") }}
            />
            <Stack.Screen
                name="PointForm"
                component={PointFormScreen}
                options={{ title: t("travel.poiForm.title") }}
            />
            <Stack.Screen name="PoiDetail" component={PointOfInterestScreen} />
            <Stack.Screen
                name="ManageCollaborators"
                component={ManageCollaboratorsScreen}
            />
            <Stack.Screen
                name="PublicProfile"
                component={PublicProfileScreen}
                options={{ title: t("explore.nav.profile") }}
            />
            <Stack.Screen
                name="PublicTravelDetail"
                component={PublicTravelDetailScreen}
                options={{ title: t("explore.nav.travelDetail") }}
            />
            <Stack.Screen
                name="PublicPointDetail"
                component={PublicPointDetailScreen}
                options={{ title: t("explore.nav.poi") }}
            />
        </Stack.Navigator>
    );
}
