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
import useLocation from "@/hooks/location/useLocation";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Typography } from "@/constants/typography";
import { TravelStackParamList } from "@/navigation/tabs/TravelNavigator";
import { formatDate, formatTime } from "@/components/utils/date";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useNotifications } from "@/hooks/useNotifications";
import { guardarIdNotificacion, NotiKeys } from "@/hooks/useLocalStorage";

import { PointFormContent } from "./PointFormContent";
import MapMarker from "@/types/models/MapMarker";
import MapOSM from "@/components/map/Map";
import { Modal, Portal, Dialog, Button } from "react-native-paper";

type PointFormRouteProp = RouteProp<TravelStackParamList, "PointEdit">;

export default function PointEditScreen() {
    const navigation = useNavigation();
    const route = useRoute<PointFormRouteProp>();
    const { travelId, pointId } = route.params as {
        travelId: string;
        pointId: string;
    };

    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const {
        updatePoint,
        fetchPointById,
        currentPoint: point,
        loading: storeLoading,
        error,
    } = usePoiStore();
    const { location, errorMsg, loading: locationLoading } = useLocation();
    const { uploadImage, uploading: uploadingImages } = useCloudinaryUpload();
    const { user } = useAuthStore();
    const { programarAvisoPOI, programarRecordatorioFotos } =
        useNotifications();

    const {
        travels,
        sharedTravels,
        getTravelById,
        fetchTravels,
        fetchSharedTravels,
    } = useTravelStore();
    const [travel, setTravel] = useState(
        travels.find((t) => t.id === travelId) ||
            sharedTravels.find((t) => t.id === travelId),
    );

    useEffect(() => {
        if (!travel) {
            getTravelById(travelId).then((t) => {
                if (t) setTravel(t);
            });
        }
    }, [travelId, travel, getTravelById]);

    useEffect(() => {
        fetchPointById(travelId, pointId);
    }, [travelId, pointId, fetchPointById]);

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

    // Fotos que ya estaban subidas a Cloudinary cuando se entró a editar.
    // Las nuevas fotos que el usuario agrega se manejan aparte (useImagePicker)
    // y recién se suben al guardar.
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

    // Una vez que llega el punto desde Firestore, precargamos el formulario.
    useEffect(() => {
        if (!point) return;
        setName(point.name ?? "");
        setNotes(point.notes ?? "");
        setVisitDate(point.visitDate ?? new Date());
        setVisitTime(point.visitDate ?? new Date());
        setAddress(point.address ?? "");
        setCapturedCoords(
            point.latitude !== undefined && point.longitude !== undefined
                ? { lat: point.latitude, lng: point.longitude }
                : null,
        );
        setExistingImageUrls(point.imageUrls ?? []);
    }, [point]);

    const {
        selectedImages,
        handlePickImages,
        handleRemovePhoto,
        dialog,
        hideDialog,
    } = useImagePicker();

    // Lo que se muestra en el formulario es la unión de fotos ya guardadas
    // (remotas) + fotos nuevas elegidas en esta sesión (locales, sin subir aún).
    const allImages = [...existingImageUrls, ...selectedImages];

    const handleRemoveAnyPhoto = (uri: string) => {
        if (existingImageUrls.includes(uri)) {
            setExistingImageUrls((prev) => prev.filter((u) => u !== uri));
        } else {
            handleRemovePhoto(uri);
        }
    };

    const inicioViaje =
        travel?.startDate instanceof Date ? travel.startDate : null;
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

    const isFormValid =
        name.trim().length > 0 && capturedCoords !== null && !isFechaInvalida;
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
        if (!isFormValid || !capturedCoords || isFechaInvalida || !point)
            return;

        try {
            // Solo subimos las fotos nuevas (locales); las que ya eran
            // remotas se mantienen tal cual en existingImageUrls.
            const remoteUrls = await Promise.all(
                selectedImages.map((uri) => uploadImage(uri)),
            );
            const validRemoteUrls = remoteUrls.filter(
                (url): url is string => url !== null,
            );
            const finalImageUrls = [...existingImageUrls, ...validRemoteUrls];

            const authorizedUsers = [
                travel?.ownerId,
                ...(travel?.privileges ?? []),
            ].filter((uid): uid is string => !!uid);

            await updatePoint(travelId, pointId, {
                name: name.trim(),
                address: address.trim(),
                notes: notes.trim(),
                visitDate: formatDate(visitDate),
                visitTime: formatTime(visitTime),
                latitude: capturedCoords.lat,
                longitude: capturedCoords.lng,
                imageUrls: finalImageUrls,
                authorizedUsers,
            });

            // fecha+hora exacta de visita para las notificaciones
            const fechaVisitaCompleta = new Date(visitDate);
            fechaVisitaCompleta.setHours(
                visitTime.getHours(),
                visitTime.getMinutes(),
                0,
                0,
            );

            // Reprograma los avisos con la fecha/nombre actualizados.
            // Nota: esto agenda nuevas notificaciones pero no cancela las
            // que ya estaban programadas para este punto antes de editarlo;
            // si tu hook de notificaciones expone una función de cancelación,
            // conviene llamarla acá antes de reprogramar para evitar avisos duplicados.
            const idVisita = await programarAvisoPOI(
                name.trim(),
                fechaVisitaCompleta,
                travelId,
                pointId,
            );
            const idFotos = await programarRecordatorioFotos(
                name.trim(),
                fechaVisitaCompleta,
                travelId,
                pointId,
            );

            if (idVisita)
                await guardarIdNotificacion(
                    NotiKeys.poiVisita(pointId),
                    idVisita,
                );
            if (idFotos)
                await guardarIdNotificacion(
                    NotiKeys.poiFotos(pointId),
                    idFotos,
                );

            if (user?.uid) {
                const isShared = sharedTravels.some((t) => t.id === travelId);
                if (isShared) {
                    await fetchSharedTravels(user.uid);
                } else {
                    await fetchTravels(user.uid);
                }
            }

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
        existingImageUrls,
    ]);

    if (!point) {
        return (
            <View
                style={[
                    styles.loaderContainer,
                    { backgroundColor: colors.grisFondoApp },
                ]}
            >
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

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
                    selectedImages={allImages}
                    handlePickImages={handlePickImages}
                    handleRemovePhoto={handleRemoveAnyPhoto}
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

            <Portal>
                <Dialog visible={dialog.visible} onDismiss={hideDialog}>
                    <Dialog.Title>{dialog.title}</Dialog.Title>
                    {dialog.message ? (
                        <Dialog.Content>
                            <Text>{dialog.message}</Text>
                        </Dialog.Content>
                    ) : null}
                    <Dialog.Actions>
                        {dialog.actions.map((action, idx) => (
                            <Button key={idx} onPress={action.onPress}>
                                {action.label}
                            </Button>
                        ))}
                    </Dialog.Actions>
                </Dialog>
            </Portal>

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
                                    location
                                        ? [
                                              location.longitude,
                                              location.latitude,
                                          ]
                                        : null
                                }
                                initialCenter={
                                    location
                                        ? [
                                              location.longitude,
                                              location.latitude,
                                          ]
                                        : undefined
                                }
                                onNewMarker={handleMapPick}
                            />
                            <TouchableOpacity
                                onPress={() => setMapPickerVisible(false)}
                                style={[
                                    styles.closeMapButton,
                                    { backgroundColor: colors.blanco },
                                ]}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color={colors.azulProfundo}
                                />
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
    loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
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
