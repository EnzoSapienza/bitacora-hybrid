import TravelFormScreen from "@/screens/travel/TravelForm/TravelFormScreen";
import TravelDetailScreen from "@/screens/travel/TravelDetail/TravelDetailScreen";
import TravelListScreen from "@/screens/travel/TravelList/TravelListScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type TravelStackParamList = {
    TravelList: undefined;
    TravelDetails: { travelId: string };
    TravelForm: undefined;
    // TODO: el form recibe, opcionalmente, un viaje parcial, si edita en vez de crear
};

const Stack = createNativeStackNavigator<TravelStackParamList>();

export default function TravelNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="TravelList" component={TravelListScreen} />
            <Stack.Screen name="TravelDetails" component={TravelDetailScreen} />
            <Stack.Screen name="TravelForm" component={TravelFormScreen} />
        </Stack.Navigator>
    );
}
