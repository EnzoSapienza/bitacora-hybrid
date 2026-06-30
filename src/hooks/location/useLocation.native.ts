import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

type LocationType = {
    latitude: number;
    longitude: number;
    address: string;
} | null;

const GEOCODE_THRESHOLD = 0.005;

async function getAddressFromCoords(
    latitude: number,
    longitude: number
): Promise<Location.LocationGeocodedAddress> {
    const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
    return address;
}

function addressToString(lugar: Location.LocationGeocodedAddress, lat: number, lng: number): string {
    const calle = lugar.street || "";
    const numero = lugar.name || "";
    const ciudad = lugar.city || lugar.subregion || "";
    return calle
        ? `${calle} ${numero}${ciudad ? `, ${ciudad}` : ""}`.trim()
        : lugar.formattedAddress || `${lat}, ${lng}`;
}

export default function useLocation() {
    const [location, setLocation] = useState<LocationType>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const lastGeocodedRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
    const isMountedRef = useRef(true);

    const startWatching = useCallback(async () => {

        subscriptionRef.current?.remove();
        subscriptionRef.current = null;

        return Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
            async (pos) => {
                if (!isMountedRef.current) return;
                const { latitude: lat, longitude: lon } = pos.coords;
                const last = lastGeocodedRef.current;
                const shouldGeocode =
                    !last ||
                    Math.abs(lat - last.latitude) > GEOCODE_THRESHOLD ||
                    Math.abs(lon - last.longitude) > GEOCODE_THRESHOLD;

                if (shouldGeocode) {
                    try {
                        const newAddressObj = await getAddressFromCoords(lat, lon);
                        if (!isMountedRef.current) return;
                        lastGeocodedRef.current = { latitude: lat, longitude: lon };
                        setLocation({ latitude: lat, longitude: lon, address: addressToString(newAddressObj, lat, lon) });
                    } catch (err) {
                        if (!isMountedRef.current) return;
                        setLocation((prev) => (prev ? { ...prev, latitude: lat, longitude: lon } : null));
                    }
                } else {
                    setLocation((prev) => (prev ? { ...prev, latitude: lat, longitude: lon } : null));
                }
            }
        );
    }, []);

    const requestPermissionAndGetLocation = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== Location.PermissionStatus.GRANTED) {
                if (isMountedRef.current) {
                    setErrorMsg("Permiso de ubicación denegado");
                    setLoading(false);
                }
                return;
            }

            const current = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = current.coords;

            if (!isMountedRef.current) return;

            // El geocoding se aísla: si falla, igual queremos disponer de las coordenadas.
            let address = `${latitude}, ${longitude}`;
            try {
                const addressObj = await getAddressFromCoords(latitude, longitude);
                address = addressToString(addressObj, latitude, longitude);
            } catch (geocodeErr) {
                // Seguimos con el fallback de coords crudas.
            }

            if (!isMountedRef.current) return;

            lastGeocodedRef.current = { latitude, longitude };
            setLocation({ latitude, longitude, address });
            setLoading(false);

            subscriptionRef.current = await startWatching();
        } catch (err) {
            if (isMountedRef.current) {
                setErrorMsg("Error al obtener la ubicación");
                setLoading(false);
            }
        }
    }, [startWatching]);

    useEffect(() => {
        isMountedRef.current = true;
        requestPermissionAndGetLocation();
        return () => {
            isMountedRef.current = false;
            subscriptionRef.current?.remove();
            subscriptionRef.current = null;
        };
    }, [requestPermissionAndGetLocation]);

    return { location, errorMsg, loading, refetch: requestPermissionAndGetLocation };
}
