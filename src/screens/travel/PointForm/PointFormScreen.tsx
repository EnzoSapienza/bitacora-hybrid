import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

import { usePoiStore } from '@/hooks/firestore/usePoiStore';
import { useTravelStore } from '@/hooks/firestore/useTravelStore';
import { useTheme } from '@/context/ThemeContext';
import useLocation from '@/hooks/useLocation';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { Typography } from '@/constants/typography';
import { TravelStackParamList } from '@/navigation/tabs/TravelNavigator';
import { formatDate, formatTime } from '@/components/utils/date';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';

import { PointFormContent } from './PointFormContent';

type PointFormRouteProp = RouteProp<TravelStackParamList, 'PointForm'>;

export default function PointFormScreen() {
    const navigation = useNavigation();
    const route = useRoute<PointFormRouteProp>();
    const { travelId } = route.params;

    const { colors } = useTheme();
    const { addPoint, loading: storeLoading, error } = usePoiStore();
    const { location, errorMsg } = useLocation();
    const { uploadImage, uploading: uploadingImages } = useCloudinaryUpload();

    const travel = useTravelStore((state) =>
        state.travels.find((t) => t.id === travelId)
    );

    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [visitDate, setVisitDate] = useState(new Date());
    const [visitTime, setVisitTime] = useState(new Date());

    const { selectedImages, handlePickImages, handleRemovePhoto } = useImagePicker();
    const { capturedCoords, address, setAddress, resolvingAddress, captureLocation } = useReverseGeocode();

    const inicioViaje = travel ? new Date(travel.startDate) : null;
    const finViaje = travel ? new Date(travel.endDate) : null;
    const isFechaInvalida = !!(inicioViaje && finViaje && (visitDate < inicioViaje || visitDate > finViaje));

    const rangoTexto = inicioViaje && finViaje
        ? `${inicioViaje.toLocaleDateString()} al ${finViaje.toLocaleDateString()}`
        : '';

    const isFormValid = name.trim().length > 0 && capturedCoords !== null && !isFechaInvalida;
    const estaCargando = storeLoading || uploadingImages || resolvingAddress;

    const handleCaptureLocation = () => captureLocation(location, errorMsg);

    const handleSave = async () => {
        if (!isFormValid || !capturedCoords || isFechaInvalida) return;

        try {
            const remoteUrls = await Promise.all(selectedImages.map(uri => uploadImage(uri)));
            const validRemoteUrls = remoteUrls.filter((url): url is string => url !== null);

            await addPoint(travelId, {
                name: name.trim(),
                address: address.trim(),
                notes: notes.trim(),
                visitDate: formatDate(visitDate),
                visitTime: formatTime(visitTime),
                latitude: capturedCoords.lat,
                longitude: capturedCoords.lng,
                imageUrls: validRemoteUrls,
            });

            navigation.goBack();
        } catch {
            // Error controlado por el store
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!isFormValid || estaCargando}
                    style={{ marginRight: 8, opacity: isFormValid && !estaCargando ? 1 : 0.4 }}
                >
                    {estaCargando ? (
                        <ActivityIndicator size="small" color={colors.azulProfundo} />
                    ) : (
                        <MaterialIcons name="check" size={26} color={colors.azulProfundo} />
                    )}
                </TouchableOpacity>
            ),
        });
    }, [navigation, isFormValid, estaCargando, name, address, notes, visitDate, visitTime, capturedCoords, selectedImages]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.grisFondoApp }]}
            contentContainerStyle={styles.content}
        >
            <PointFormContent
                currentColors={colors}
                name={name}
                setName={setName}
                address={address}
                setAddress={setAddress}
                notes={notes}
                setNotes={setNotes}
                visitDate={visitDate}
                setVisitDate={setVisitDate}
                visitTime={visitTime}
                setVisitTime={setVisitTime}
                capturedCoords={capturedCoords}
                handleCaptureLocation={handleCaptureLocation}
                selectedImages={selectedImages}
                handlePickImages={handlePickImages}
                handleRemovePhoto={handleRemovePhoto}
                resolvingAddress={resolvingAddress}
                isFechaInvalida={isFechaInvalida}
                rangoTexto={rangoTexto}
            />

            {error && (
                <Text style={[Typography.bodyMedium, { color: colors.rojoPin, marginTop: 12, textAlign: 'center' }]}>
                    {error}
                </Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
});