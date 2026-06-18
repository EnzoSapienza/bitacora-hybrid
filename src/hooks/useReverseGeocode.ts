import { useState } from 'react';
import * as Location from 'expo-location';

export function useReverseGeocode() {
    const [capturedCoords, setCapturedCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState('');
    const [resolvingAddress, setResolvingAddress] = useState(false);

    const captureLocation = async (location: { latitude: number; longitude: number } | null, errorMsg: string | null) => {
        if (errorMsg || !location) return;

        const { latitude: lat, longitude: lng } = location;
        setCapturedCoords({ lat, lng });
        setResolvingAddress(true);

        try {
            const resultado = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });

            if (resultado && resultado.length > 0) {
                const lugar = resultado[0];
                const calle = lugar.street || '';
                const numero = lugar.name || '';
                const ciudad = lugar.city || lugar.subregion || '';

                const direccionCompleta = calle
                    ? `${calle} ${numero}${ciudad ? `, ${ciudad}` : ''}`.trim()
                    : lugar.formattedAddress || `Ubicación (${lat}, ${lng})`;

                setAddress(direccionCompleta);
            } else {
                throw new Error('Fallo nativo');
            }
        } catch {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
                    { headers: { 'User-Agent': 'BitacoraViajesApp/1.0' } }
                );
                const data = await response.json();
                setAddress(data?.display_name || `Lat: ${lat}, Lng: ${lng}`);
            } catch {
                setAddress(`Lat: ${lat}, Lng: ${lng}`);
            }
        } finally {
            setResolvingAddress(false);
        }
    };

    return { capturedCoords, address, setAddress, resolvingAddress, captureLocation };
}