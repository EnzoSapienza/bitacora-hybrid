/**
 * Stack de uso genérico
 */

import TravelNavigator from "./tabs/TravelNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./AppTabs";

export type AppTabParamList = {
    Tabs: undefined;
    Travel: { travelId: string };
};

const Stack = createNativeStackNavigator<{ Tabs: undefined }>();

export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Tabs"
                component={AppTabs}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
