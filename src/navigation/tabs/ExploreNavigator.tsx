import TopBarMenu from "@/components/top_bar_menu/TopBarMenu";
import ExploreScreen from "@/screens/explore/ExploreScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type ExploreStackParamList = {
    ExploreMain: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="ExploreMain"
                component={ExploreScreen}
                options={{
                    title: "Explorar",
                    headerShown: true,
                    headerRight: () => <TopBarMenu />,
                }}
            />
        </Stack.Navigator>
    );
}
