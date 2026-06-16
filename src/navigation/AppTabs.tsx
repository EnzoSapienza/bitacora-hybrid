/**
 * Las tres pestañas principales
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapNavigator from "./tabs/MapNavigator";
import ExploreNavigator from "./tabs/ExploreNavigator";
import HomeNavigator from "./tabs/HomeNavigator";

export type AppTabParamList = {
    Home: undefined;
    Explore: undefined;
    Map: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreNavigator}
                options={{ headerShown: false }}
            />
            <Tab.Screen
                name="Map"
                component={MapNavigator}
                options={{ headerShown: false }}
            />
        </Tab.Navigator>
    );
}
