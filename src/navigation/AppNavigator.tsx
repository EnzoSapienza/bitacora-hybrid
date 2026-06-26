/**
 * Stack de uso genérico
 */

import TravelNavigator, { TravelStackParamList } from "./tabs/TravelNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./AppTabs";
import { NavigatorScreenParams } from "@react-navigation/native";

export type AppStackParamList = {
    Tabs: undefined;
    Travel: NavigatorScreenParams<TravelStackParamList>;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={AppTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Travel"
                component={TravelNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
