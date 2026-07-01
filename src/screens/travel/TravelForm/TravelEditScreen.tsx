import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { parse, isValid, startOfDay, endOfDay, format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Portal, Dialog, Button } from 'react-native-paper';
import { useTravelStore } from '../../../hooks/firestore/useTravelStore';
import { useAuth } from '../../../hooks/useAuth';
import { useAppStore } from '../../../store/appStore';
import { useCloudinaryUpload } from '../../../hooks/useCloudinaryUpload';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { Typography } from '../../../constants/typography';
import { calcDurationDays } from '@/components/utils/date';
import { useNotifications } from '@/hooks/useNotifications';
import { guardarIdNotificacion, NotiKeys } from '@/hooks/useLocalStorage';
import { TravelFormContent } from './TravelFormContent';
import Travel from '../../../types/models/travel';
import { TravelStackParamList } from '@/navigation/tabs/TravelNavigator';

type TravelEditRouteProp = RouteProp<TravelStackParamList, 'TravelEdit'>;

export default function TravelEditScreen() {
    const navigation = useNavigation();
    const route = useRoute<TravelEditRouteProp>();
    const { travelId } = route.params;

    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { user } = useAuth();
    const { updateTravel, getTravelById, loading: storeLoading, error } = useTravelStore();
    const { uploadImage, uploading } = useCloudinaryUpload();
    const { singleImage, handlePickImages, dialog, hideDialog } = useImagePicker(false);
    const { programarAvisoInicioViaje, programarAvisoPreparacion } = useNotifications();

    const [travel, setTravel] = useState<Travel | null>(null);

    useEffect(() => {
        getTravelById(travelId).then((tr) => {
            if (tr) setTravel(tr);
        });
    }, [travelId, getTravelById]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDateStr, setStartDateStr] = useState('');
    const [endDateStr, setEndDateStr] = useState('');
    const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'FOLLOWERS'>('PRIVATE');

    // Imagen que el viaje ya tenía subida a Cloudinary. Si el usuario elige
    // una nueva (singleImage, local), esa es la que se sube al guardar;
    // si no toca la foto, se conserva esta.
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

    // Una vez que llega el viaje, precargamos el formulario.
    useEffect(() => {
        if (!travel) return;
        setName(travel.name ?? '');
        setDescription(travel.description ?? '');
        setStartDateStr(
            travel.startDate instanceof Date ? format(travel.startDate, 'dd/MM/yyyy') : '',
        );
        setEndDateStr(
            travel.endDate instanceof Date ? format(travel.endDate, 'dd/MM/yyyy') : '',
        );
        setVisibility(
            (travel.visibility?.toUpperCase() as 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS') || 'PRIVATE',
        );
        setExistingImageUrl(travel.imageUrl ?? null);
    }, [travel]);

    const isSubmittingRef = useRef(false);

    const baseStartDate = startDateStr ? parse(startDateStr, 'dd/MM/yyyy', new Date()) : null;
    const baseEndDate = endDateStr ? parse(endDateStr, 'dd/MM/yyyy', new Date()) : null;

    const isStartDateValid = baseStartDate && isValid(baseStartDate);
    const isEndDateValid = baseEndDate && isValid(baseEndDate);

    let dateError: string | null = null;
    if (isStartDateValid && isEndDateValid) {
        if (startOfDay(baseStartDate!) > endOfDay(baseEndDate!)) {
            dateError = t('travel.form.dateError');
        }
    }

    const isFormValid =
        !!travel &&
        name.trim().length > 0 &&
        isStartDateValid &&
        isEndDateValid &&
        !dateError &&
        user?.uid;

    const estaCargando = storeLoading || uploading;

    const displayedImageUrl = singleImage ?? existingImageUrl;

    const handleSave = async () => {
        if (isSubmittingRef.current) return;
        if (!isFormValid || !baseStartDate || !baseEndDate || !travel) return;

        isSubmittingRef.current = true;

        const finalStartDate = startOfDay(baseStartDate);
        const finalEndDate = endOfDay(baseEndDate);

        try {
            let finalImageUrl = existingImageUrl;

            if (singleImage) {
                const remoteUrl = await uploadImage(singleImage);
                if (!remoteUrl) {
                    alert(t('travel.form.uploadError'));
                    return;
                }
                finalImageUrl = remoteUrl;
            }

            await updateTravel(travelId, travel.ownerId, {
                name: name.trim(),
                description: description.trim(),
                startDate: finalStartDate,
                endDate: finalEndDate,
                visibility: visibility.toLowerCase(),
                durationDays: calcDurationDays(finalStartDate, finalEndDate),
                imageUrl: finalImageUrl,
                updatedAt: new Date(),
            });

            // Reprograma los avisos con la fecha/nombre actualizados.
            // Nota: esto agenda nuevos avisos pero no cancela los que ya
            // estaban programados para este viaje antes de editarlo; si tu
            // hook de notificaciones expone una función de cancelación,
            // conviene llamarla acá antes de reprogramar para evitar avisos duplicados.
            const idInicio = await programarAvisoInicioViaje(name.trim(), finalStartDate, travelId);
            const idPrep = await programarAvisoPreparacion(name.trim(), finalStartDate, travelId);

            if (idInicio) await guardarIdNotificacion(NotiKeys.travelInicio(travelId), idInicio);
            if (idPrep) await guardarIdNotificacion(NotiKeys.travelPrep(travelId), idPrep);

            navigation.goBack();
        } catch {
            // error manejado por el store
        } finally {
            isSubmittingRef.current = false;
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
    }, [navigation, isFormValid, estaCargando, name, description, startDateStr, endDateStr, visibility, singleImage, existingImageUrl]);

    if (!travel) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    return (
        <>
            <ScrollView
                style={[styles.container, { backgroundColor: colors.grisFondoApp }]}
                contentContainerStyle={styles.content}
            >
                <TravelFormContent
                    currentColors={colors}
                    name={name}
                    setName={setName}
                    description={description}
                    setDescription={setDescription}
                    startDateStr={startDateStr}
                    setStartDateStr={setStartDateStr}
                    endDateStr={endDateStr}
                    setEndDateStr={setEndDateStr}
                    visibility={visibility}
                    setVisibility={setVisibility}
                    imageUrl={displayedImageUrl}
                    handlePickImages={handlePickImages}
                    dateError={dateError}
                />

                {error && (
                    <Text style={[Typography.bodyMedium, { color: colors.rojoPin, marginTop: 12, textAlign: 'center' }]}>
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
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 20, paddingBottom: 40 },
});
