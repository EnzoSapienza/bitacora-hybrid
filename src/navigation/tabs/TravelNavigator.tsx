import TravelFormScreen from "@/screens/travel/TravelForm/TravelFormScreen";
import TravelDetailScreen from "@/screens/travel/TravelDetail/TravelDetailScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type TravelStackParamList = {
    TravelDetails: { travelId: string };
    TravelForm: undefined;
    // TODO: Puntos de interés
};

const Stack = createNativeStackNavigator<TravelStackParamList>();

export default function TravelNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="TravelDetails" component={TravelDetailScreen} />
            <Stack.Screen name="TravelForm" component={TravelFormScreen} />
        </Stack.Navigator>
    );
}
