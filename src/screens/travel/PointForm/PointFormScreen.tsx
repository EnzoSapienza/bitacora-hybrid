import React, { useState, useEffect } from "react";
import {
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { usePoiStore } from "@/hooks/firestore/usePoiStore";
import { useTravelStore } from "@/hooks/firestore/useTravelStore";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import useLocation from "@/hooks/useLocation";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Typography } from "@/constants/typography";
import { TravelStackParamList } from "@/navigation/tabs/TravelNavigator";
import { formatDate, formatTime } from "@/components/utils/date";
import { useImagePicker } from "@/hooks/useImagePicker";

import { PointFormContent } from "./PointFormContent";
import MapMarker from "@/types/models/MapMarker";
import MapOSM from "@/components/map/Map";
import { Modal, Portal } from "react-native-paper";

type PointFormRouteProp = RouteProp<TravelStackParamList, "PointForm">;

export default function PointFormScreen() {
    const navigation = useNavigation();
    const route = useRoute<PointFormRouteProp>();
    const { travelId } = route.params;

    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { addPoint, loading: storeLoading, error } = usePoiStore();
    const { location, errorMsg, loading: locationLoading } = useLocation();
    const { uploadImage, uploading: uploadingImages } = useCloudinaryUpload();
    const { user } = useAuthStore();

    const { travels, sharedTravels, getTravelById, fetchTravels, fetchSharedTravels } = useTravelStore();
    const [travel, setTravel] = useState(
        travels.find((t) => t.id === travelId) || sharedTravels.find((t) => t.id === travelId)
    );

    useEffect(() => {
        if (!travel) {
            getTravelById(travelId).then((t) => {
                if (t) setTravel(t);
            });
        }
    }, [travelId, travel, getTravelById]);

    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [visitDate, setVisitDate] = useState(new Date());
    const [visitTime, setVisitTime] = useState(new Date());
    const [capturedCoords, setCapturedCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [address, setAddress] = useState("");
    const [mapPickerVisible, setMapPickerVisible] = useState(false);

    const { selectedImages, handlePickImages, handleRemovePhoto } = useImagePicker();

    const inicioViaje = travel?.startDate instanceof Date ? travel.startDate : null;
    const finViaje = travel?.endDate instanceof Date ? travel.endDate : null;
    const isFechaInvalida = !!(
        inicioViaje &&
        finViaje &&
        (visitDate < inicioViaje || visitDate > finViaje)
    );

    const rangoTexto =
        inicioViaje && finViaje
            ? `${formatDate(inicioViaje)} ${t("travel.poiForm.dateRangeJoin")} ${formatDate(finViaje)}`
            : "";

    const isFormValid = name.trim().length > 0 && capturedCoords !== null && !isFechaInvalida;
    const estaCargando = storeLoading || uploadingImages || locationLoading;

    const handleCaptureLocation = () => {
        if (!location || errorMsg) return;
        setCapturedCoords({ lat: location.latitude, lng: location.longitude });
        setAddress(location.address);
    };

    function handleMapPick(mark: MapMarker) {
        const [lng, lat] = mark.coords;
        setCapturedCoords({ lat, lng });
        setAddress(mark.address ?? "");
        setMapPickerVisible(false);
    }

    const handleSave = async () => {
        if (!isFormValid || !capturedCoords || isFechaInvalida) return;

        try {
            const remoteUrls = await Promise.all(
                selectedImages.map((uri) => uploadImage(uri)),
            );
            const validRemoteUrls = remoteUrls.filter(
                (url): url is string => url !== null,
            );

            const authorizedUsers = [
                travel?.ownerId,
                ...(travel?.privileges ?? []),
            ].filter((uid): uid is string => !!uid);

            await addPoint(travelId, {
                name: name.trim(),
                address: address.trim(),
                notes: notes.trim(),
                visitDate: formatDate(visitDate),
                visitTime: formatTime(visitTime),
                latitude: capturedCoords.lat,
                longitude: capturedCoords.lng,
                imageUrls: validRemoteUrls,
                authorizedUsers,
            });

            if (user?.uid) {
                const isShared = sharedTravels.some((t) => t.id === travelId);
                if (isShared) {
                    await fetchSharedTravels(user.uid);
                } else {
                    await fetchTravels(user.uid);
                }
            }

            navigation.goBack();
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!isFormValid || estaCargando}
                    style={{
                        marginRight: 8,
                        opacity: isFormValid && !estaCargando ? 1 : 0.4,
                    }}
                >
                    {estaCargando ? (
                        <ActivityIndicator
                            size="small"
                            color={colors.azulProfundo}
                        />
                    ) : (
                        <MaterialIcons
                            name="check"
                            size={26}
                            color={colors.azulProfundo}
                        />
                    )}
                </TouchableOpacity>
            ),
        });
    }, [
        navigation,
        isFormValid,
        estaCargando,
        name,
        address,
        notes,
        visitDate,
        visitTime,
        capturedCoords,
        selectedImages,
    ]);

    return (
        <>
            <ScrollView
                style={[
                    styles.container,
                    { backgroundColor: colors.grisFondoApp },
                ]}
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
                    resolvingAddress={locationLoading}
                    isFechaInvalida={isFechaInvalida}
                    rangoTexto={rangoTexto}
                    onOpenMapPicker={() => setMapPickerVisible(true)}
                />

                {error && (
                    <Text
                        style={[
                            Typography.bodyMedium,
                            {
                                color: colors.rojoPin,
                                marginTop: 12,
                                textAlign: "center",
                            },
                        ]}
                    >
                        {error}
                    </Text>
                )}
            </ScrollView>

            {mapPickerVisible && (
                <Portal>
                    <Modal
                        visible={mapPickerVisible}
                        onDismiss={() => setMapPickerVisible(false)}
                        contentContainerStyle={{ flex: 1 }}
                    >
                        <View style={{ flex: 1 }}>
                            <MapOSM
                                clickable
                                showUserLocation
                                followUserLocation
                                userLocation={
                                    location ? [location.longitude, location.latitude] : null
                                }
                                initialCenter={
                                    location ? [location.longitude, location.latitude] : undefined
                                }
                                onNewMarker={handleMapPick}
                            />
                            <TouchableOpacity
                                onPress={() => setMapPickerVisible(false)}
                                style={[styles.closeMapButton, { backgroundColor: colors.blanco }]}
                            >
                                <MaterialIcons name="close" size={24} color={colors.azulProfundo} />
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </Portal>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    closeMapButton: {
        position: "absolute",
        top: 50,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
});
