import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TravelDetailScreen from "@/screens/travel/TravelDetail/TravelDetailScreen";
import TravelFormScreen from "@/screens/travel/TravelForm/TravelFormScreen";
import PointFormScreen from "@/screens/travel/PointForm/PointFormScreen";
import PointOfInterestScreen from "@/screens/travel/PointOfInterestScreen/PointOfInterestScreen";

export type TravelStackParamList = {
    TravelDetails: { travelId: string };
    TravelForm: undefined;
    PoiDetail: { pointId: string; travelId: string };
    PointForm: { travelId: string };
};

const Stack = createNativeStackNavigator<TravelStackParamList>();

export default function TravelNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="TravelDetails" component={TravelDetailScreen} />
            <Stack.Screen name="TravelForm" component={TravelFormScreen} />
            <Stack.Screen name="PointForm" component={PointFormScreen} />
            <Stack.Screen name="PoiDetail" component={PointOfInterestScreen} />
        </Stack.Navigator>
    );
}
