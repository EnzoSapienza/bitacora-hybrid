import MapaOSM from "@/components/map/Map";
import type MapMarker from "@/types/models/MapMarker";
import useLocation from "@/hooks/useLocation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/AppNavigator";

const lugares: MapMarker[] = [
    {
        id: "1",
        coords: [-58.3816, -34.6037],
        name: "Obelisco",
        address: "Algo",
    },
    {
        id: "2",
        coords: [-58.4173, -34.5631],
        name: "Idk",
        address: "Algo",
    },
];

export default function MapScreen() {
    const { location } = useLocation();
    const navigation =
        useNavigation<NativeStackNavigationProp<AppStackParamList>>();

    return (
        <MapaOSM
            userLocation={
                location ? [location.longitude, location.latitude] : null
            }
            showUserLocation
            followUserLocation
            markers={lugares}
            onMarker={(marker) =>
                navigation.navigate("Travel", {
                    screen: "TravelDetails",
                    params: { travelId: marker.id },
                })
            }
        />
    );
}
