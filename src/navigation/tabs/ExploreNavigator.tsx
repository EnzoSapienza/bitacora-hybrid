import TravelFormScreen from "@/screens/travel/TravelForm/TravelFormScreen";
import TravelDetailScreen from "@/screens/travel/TravelDetail/TravelDetailScreen";
import TravelListScreen from "@/screens/travel/TravelList/TravelListScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type ExploreStackParamList = {
    TravelList: undefined;
    TravelDetails: { travelId: string };
    TravelForm: undefined;
    // TODO: Puntos de interés
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="TravelList" component={TravelListScreen} />
            <Stack.Screen name="TravelDetails" component={TravelDetailScreen} />
            <Stack.Screen name="TravelForm" component={TravelFormScreen} />
        </Stack.Navigator>
    );
}
