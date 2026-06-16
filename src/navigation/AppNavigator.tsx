/**
 * Navegador genérico de la app tras autenticarse
 */

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapNavigator from "./tabs/MapNavigator";
import TravelNavigator from "./tabs/TravelNavigator";
import HomeScreen from "@/screens/app/HomeScreen";
import TopBarMenu from "@/components/top_bar/TopBarMenu";

export type AppTabParamList = {
    Home: undefined;
    Travel: undefined;
    Map: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: "Inicio",
                    headerShown: true,
                    headerRight: () => <TopBarMenu />,
                }}
            />
            <Tab.Screen name="Travel" component={TravelNavigator} />
            <Tab.Screen name="Map" component={MapNavigator} />
        </Tab.Navigator>
    );
}
