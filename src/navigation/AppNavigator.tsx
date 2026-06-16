/**
 * Navegador genérico de la app tras autenticarse
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapNavigator from "./tabs/MapNavigator";
import TravelNavigator from "./tabs/TravelNavigator";
import HomeScreen from "@/screens/app/HomeScreen";

export type AppTabParamList = {
    Home: undefined;
    Travel: undefined;
    Map: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Travel" component={TravelNavigator} />
            <Tab.Screen name="Map" component={MapNavigator} />
        </Tab.Navigator>
    );
}
