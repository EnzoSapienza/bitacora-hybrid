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
    const calle = lugar.street || '';
    const numero = lugar.name || '';
    const ciudad = lugar.city || lugar.subregion || '';
    return calle
        ? `${calle} ${numero}${ciudad ? `, ${ciudad}` : ''}`.trim()
        : lugar.formattedAddress || `${lat}, ${lng}`;
}

export default function useLocation() {
    const [location, setLocation] = useState<LocationType>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const lastGeocodedRef = useRef<{ latitude: number; longitude: number } | null>(null);

    const requestPermissionAndGetLocation = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);

        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== Location.PermissionStatus.GRANTED) {
                setErrorMsg("Permiso de ubicación denegado");
                return;
            }

            const current = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = current.coords;

            const addressObj = await getAddressFromCoords(latitude, longitude);
            lastGeocodedRef.current = { latitude, longitude };

            setLocation({ latitude, longitude, address: addressToString(addressObj, latitude, longitude) });
            setLoading(false);

            const subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
                async (pos) => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    const last = lastGeocodedRef.current;

                    const shouldGeocode =
                        !last ||
                        Math.abs(lat - last.latitude) > GEOCODE_THRESHOLD ||
                        Math.abs(lon - last.longitude) > GEOCODE_THRESHOLD;

                    if (shouldGeocode) {
                        try {
                            const newAddressObj = await getAddressFromCoords(lat, lon);
                            lastGeocodedRef.current = { latitude: lat, longitude: lon };
                            setLocation({ latitude: lat, longitude: lon, address: addressToString(newAddressObj, lat, lon) });
                        } catch {
                            setLocation((prev) => prev ? { ...prev, latitude: lat, longitude: lon } : null);
                        }
                    } else {
                        setLocation((prev) => prev ? { ...prev, latitude: lat, longitude: lon } : null);
                    }
                }
            );

            return () => subscription.remove();

        } catch {
            setErrorMsg("Error al obtener la ubicación");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cleanup: (() => void) | undefined;
        requestPermissionAndGetLocation().then((fn) => { cleanup = fn; });
        return () => cleanup?.();
    }, [requestPermissionAndGetLocation]);

    return { location, errorMsg, loading, refetch: requestPermissionAndGetLocation };
}