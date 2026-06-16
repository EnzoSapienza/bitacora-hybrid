import TopBarMenu from "@/components/top_bar/TopBarMenu";
import HomeScreen from "@/screens/app/HomeScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type HomeStackParamlist = {
    Home: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamlist>();

export default function HomeNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: "Inicio",
                    headerShown: true,
                    headerRight: () => <TopBarMenu />,
                }}
            ></Stack.Screen>
        </Stack.Navigator>
    );
}
