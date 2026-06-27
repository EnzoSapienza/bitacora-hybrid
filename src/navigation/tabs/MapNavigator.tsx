import MapScreen from "@/screens/map/MapScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

export type TravelStackParamList = {
    MapScreen: undefined;
};

const Stack = createNativeStackNavigator<TravelStackParamList>();

export default function MapNavigator() {
    const { t } = useTranslation();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{
                    title: t("map.title"),
                    headerShown: true,
                }}
            />
        </Stack.Navigator>
    );
}
