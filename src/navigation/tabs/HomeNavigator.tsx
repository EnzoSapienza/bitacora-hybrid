import TopBarMenu from "@/components/top_bar_menu/TopBarMenu";
import HomeScreen from "@/screens/home/HomeScreen";
import TravelNavigator from "./TravelNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";

export type HomeStackParamlist = {
    Mine: undefined;
    Shared: undefined;
    Travel: { travelId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamlist>();

export default function HomeNavigator() {
    const { t } = useTranslation();

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Mine"
                component={HomeScreen}
                options={{
                    title: t("home.title"),
                    headerShown: true,
                    headerRight: () => <TopBarMenu />,
                }}
            />
            <Stack.Screen
                name="Travel"
                component={TravelNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
