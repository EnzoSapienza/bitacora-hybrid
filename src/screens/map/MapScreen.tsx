import { useCallback, useEffect } from "react";
import MapaOSM from "@/components/map/Map";
import useLocation from "@/hooks/useLocation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "@/navigation/AppNavigator";
import { useAuthStore } from "@/store/authStore";
import { calculateDistanceKm } from "@/components/utils/geohash";
import { useNearbyPoiStore } from "@/hooks/explore/useNearbyPointStore";

export default function MapScreen() {
    const { location } = useLocation();
    const navigation =
        useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const { user } = useAuthStore();
    const { fetchNearby, visibleMarkers } = useNearbyPoiStore();

    useEffect(() => {
        if (user?.uid && location) {
            fetchNearby(
                user.uid,
                { lat: location.latitude, lng: location.longitude },
                5,
            );
        }
    }, [user?.uid, location, fetchNearby]);

    const handleViewportChange = useCallback(
        (center: { lat: number; lng: number }, bounds: any) => {
            if (!user?.uid) return;
            const radiusKm = calculateDistanceKm(
                center.lat,
                center.lng,
                bounds.north,
                bounds.east,
            );
            fetchNearby(user.uid, center, radiusKm);
        },
        [user?.uid, fetchNearby],
    );

    return (
        <MapaOSM
            userLocation={
                location ? [location.longitude, location.latitude] : null
            }
            showUserLocation
            followUserLocation
            markers={visibleMarkers}
            onViewportChange={handleViewportChange}
            onMarker={(marker) =>
                navigation.navigate("Travel", {
                    screen: "PoiDetail",
                    params: { travelId: marker.tripId!, pointId: marker.id },
                })
            }
        />
    );
}
