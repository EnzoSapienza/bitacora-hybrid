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
import { reverseGeocode } from "@/components/utils/geocoding";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
    initialCenter?: LngLat;
    initialZoom?: number;
    markers?: MapMarker[];
    onMarker?: (marker: MapMarker) => void;
    clickable?: boolean;
    onNewMarker?: (marker: MapMarker) => void;
    userLocation?: LngLat | null;
    showUserLocation?: boolean;
    followUserLocation?: boolean;
    onViewportChange?: (
        center: { lat: number; lng: number },
        bounds: { north: number; south: number; east: number; west: number },
    ) => void;
    interactive?: boolean;
};

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

const NEW_PIN_ID = "__new_pin__";

export default function MapaOSM({
    initialCenter = [0, 0],
    initialZoom = 13,
    markers = [],
    onMarker = () => {},
    clickable = false,
    onNewMarker = () => {},
    userLocation,
    showUserLocation = false,
    followUserLocation = false,
    onViewportChange,
    interactive = true,
}: Props) {
    const cameraRef = useRef<CameraRef>(null);
    const centeredRef = useRef(false);
    const viewportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    const { t } = useTranslation();

    const [pickedMarker, setPickedMarker] = useState<MapMarker | null>(null);
    const pinRequestRef = useRef(0);

    useEffect(() => {
        if (!followUserLocation || !userLocation || centeredRef.current) return;
        cameraRef.current?.flyTo({ center: userLocation, zoom: initialZoom });
        centeredRef.current = true;
    }, [followUserLocation, userLocation, initialZoom]);

    const isNewPin = pickedMarker?.id === NEW_PIN_ID;

    function handleMapPress(event: any) {
        if (!clickable) return;

        const lngLat: LngLat | undefined = event?.nativeEvent?.lngLat;
        if (!lngLat) return;

        createTemporaryPin(lngLat);
    }

    function createTemporaryPin(lngLat: LngLat) {
        const requestId = ++pinRequestRef.current;

        setPickedMarker({
            id: NEW_PIN_ID,
            coords: lngLat,
            name: t("map.searching_address"),
            address: "",
        } as MapMarker);

        reverseGeocode(lngLat)
            .then((result) => {
                if (pinRequestRef.current !== requestId) return;
                setPickedMarker((current) =>
                    current && current.id === NEW_PIN_ID
                        ? ({ ...current, ...result } as MapMarker)
                        : current,
                );
            })
            .catch(() => {
                if (pinRequestRef.current !== requestId) return;
                setPickedMarker((current) =>
                    current && current.id === NEW_PIN_ID
                        ? ({
                              ...current,
                              name: t("map.name_placeholder"),
                              address: t("map.address_placeholder"),
                          } as MapMarker)
                        : current,
                );
            });
    }

    function handleAcceptMore() {
        if (!pickedMarker) return;

        if (pickedMarker.id === NEW_PIN_ID) {
            setPickedMarker(null);
            onNewMarker(pickedMarker);
        } else {
            onMarker(pickedMarker);
        }
    }

    useEffect(() => {
        return () => {
            if (viewportTimeoutRef.current)
                clearTimeout(viewportTimeoutRef.current);
        };
    }, []);

    function handleRegionDidChange(event: any) {
        if (!onViewportChange) return;
        if (viewportTimeoutRef.current)
            clearTimeout(viewportTimeoutRef.current);

        viewportTimeoutRef.current = setTimeout(() => {
            const visibleBounds = event?.properties?.visibleBounds;
            if (!visibleBounds) return;

            const [[east, north], [west, south]] = visibleBounds;
            onViewportChange(
                { lat: (north + south) / 2, lng: (east + west) / 2 },
                { north, south, east, west },
            );
        }, 400);
    }

    function centerOnUser() {
        if (!userLocation) return;

        cameraRef.current?.flyTo({
            center: userLocation,
            zoom: initialZoom,
        });
    }

    return (
        <View style={styles.container}>
            <Map
                style={styles.map}
                mapStyle={OPENFREEMAP_STYLE}
                onPress={clickable ? handleMapPress : undefined}
                onRegionDidChange={handleRegionDidChange}
                dragPan={interactive}
                touchZoom={interactive}
                doubleTapZoom={interactive}
                doubleTapHoldZoom={interactive}
                touchRotate={interactive}
                touchPitch={interactive}
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
                        onPress={
                            interactive
                                ? () => setPickedMarker(marker)
                                : undefined
                        }
                    >
                        <View style={styles.pin} />
                    </Marker>
                ))}

                {isNewPin && pickedMarker && (
                    <Marker key={pickedMarker.id} lngLat={pickedMarker.coords}>
                        <View style={styles.newPin} />
                    </Marker>
                )}

                {showUserLocation && userLocation && (
                    <Marker key="__user_location__" lngLat={userLocation}>
                        <View style={styles.userPin} />
                    </Marker>
                )}
            </Map>
            {showUserLocation && userLocation && (
                <Pressable
                    style={styles.centerButton}
                    onPress={centerOnUser}
                    hitSlop={8}
                >
                    <MaterialIcons
                        name="my-location"
                        size={24}
                        color="#1a73e8"
                    />
                </Pressable>
            )}

            {pickedMarker !== null && (
                <MarkerCard
                    mapMarker={pickedMarker}
                    onCancel={() => setPickedMarker(null)}
                    moreText={t("common.details")}
                    onMore={handleAcceptMore}
                />
            )}
        </View>
    );
}

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
    newPin: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#f4a261",
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
    centerButton: {
        position: "absolute",
        right: 16,
        bottom: 24,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",

        elevation: 4,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },
});
