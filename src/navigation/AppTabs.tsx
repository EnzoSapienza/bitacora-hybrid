/**
 * Las tres pestañas principales
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import MapNavigator from "./tabs/MapNavigator";
import ExploreNavigator from "./tabs/ExploreNavigator";
import HomeNavigator from "./tabs/HomeNavigator";
import { useAppStore } from "@/store/appStore";

export type AppTabParamList = {
    Home: undefined;
    Explore: undefined;
    Map: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
    const { t } = useTranslation();
    const colors = useAppStore((s) => s.themescolors);

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.azulProfundo,
                tabBarInactiveTintColor: colors.grisMedio,
                tabBarStyle: {
                    backgroundColor: colors.blanco,
                    borderTopColor: colors.grisClaro,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{
                    headerShown: false,
                    title: t("home.title"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreNavigator}
                options={{
                    headerShown: false,
                    title: t("explore.title"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="explore" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapNavigator}
                options={{
                    headerShown: false,
                    title: t("map.title"),
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="map" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}