import { useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import {
    Camera,
    LngLat,
    Map,
    Marker,
    type CameraRef,
} from "@maplibre/maplibre-react-native";
import MapMarker from "@/types/models/MapMarker";
import MarkerCard from "./MarkerCard";
type Props = {
    initialCenter?: LngLat;
    initialZoom?: number;
    markers?: MapMarker[];
    onMarker?: (marker: MapMarker) => void;
    clickable: boolean;
    userLocation?: LngLat | null;
    showUserLocation?: boolean;
    followUserLocation?: boolean;
};
const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
export default function MapaOSM({
    initialCenter = [-58.3816, -34.6037],
    initialZoom = 13,
    markers = [],
    onMarker = () => {},
    clickable = false,
    userLocation,
    showUserLocation = false,
    followUserLocation = false,
}: Props) {
    const cameraRef = useRef<CameraRef>(null);
    const centeredRef = useRef(false);
    let [pickedMarker, setPickedMarker] = useState<MapMarker | null>(null);
    useEffect(() => {
        if (!followUserLocation || !userLocation || centeredRef.current) return;
        cameraRef.current?.flyTo({ center: userLocation, zoom: initialZoom });
        centeredRef.current = true;
    }, [followUserLocation, userLocation, initialZoom]);
    return (
        <View style={styles.container}>
            <Map
                style={styles.map}
                mapStyle={OPENFREEMAP_STYLE}
                onPress={onMapPress}
            >
                <Camera
                    ref={cameraRef}
                    initialViewState={{
                        center: initialCenter,
                        zoom: initialZoom,
                    }}
                />
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        lngLat={marker.coords}
                        onPress={() => setPickedMarker(marker)}
                    >
                        <View style={styles.pin} />
                    </Marker>
                ))}
                {showUserLocation && userLocation && (
                    <Marker key="__user_location__" lngLat={userLocation}>
                        <View style={styles.userPin} />
                    </Marker>
                )}
            </Map>
            {pickedMarker !== null && (
                <MarkerCard
                    mapMarker={pickedMarker}
                    onCancel={() => setPickedMarker(null)}
                    moreText="Ver más"
                    onMore={() => onMarker(pickedMarker)}
                />
            )}
        </View>
    );
}
function onMapPress() {}
const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    pin: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#e63946",
        borderWidth: 2,
        borderColor: "#fff",
    },
    userPin: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#1a73e8",
        borderWidth: 2,
        borderColor: "#fff",
    },
});
