import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { parse, isValid, startOfDay, endOfDay } from 'date-fns';
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

export default function TravelFormScreen() {
    const navigation = useNavigation();
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { user } = useAuth();
    const { addTravel, loading: storeLoading, error } = useTravelStore();
    const { uploadImage, uploading } = useCloudinaryUpload();
    const { singleImage, handlePickImages, dialog, hideDialog } = useImagePicker(false);
    const { programarAvisoInicioViaje, programarAvisoPreparacion } = useNotifications();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDateStr, setStartDateStr] = useState('');
    const [endDateStr, setEndDateStr] = useState('');
    const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'FOLLOWERS'>('PRIVATE');

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
        name.trim().length > 0 &&
        isStartDateValid &&
        isEndDateValid &&
        !dateError &&
        user?.uid;

    const estaCargando = storeLoading || uploading;

    const handleSave = async () => {
        if (isSubmittingRef.current) return;
        if (!isFormValid || !baseStartDate || !baseEndDate) return;

        isSubmittingRef.current = true;

        const finalStartDate = startOfDay(baseStartDate);
        const finalEndDate = endOfDay(baseEndDate);

        try {
            let remoteUrl = null;

            if (singleImage) {
                remoteUrl = await uploadImage(singleImage);
                if (!remoteUrl) {
                    alert(t('travel.form.uploadError'));
                    return;
                }
            }

            const travelId = await addTravel({
                name: name.trim(),
                description: description.trim(),
                ownerId: user!.uid,
                startDate: finalStartDate,
                endDate: finalEndDate,
                visibility: visibility.toLowerCase(),
                pointsCount: 0,
                durationDays: calcDurationDays(finalStartDate, finalEndDate),
                imageUrl: remoteUrl,
                privileges: [],
                updatedAt: new Date(),
            });

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
    }, [navigation, isFormValid, estaCargando, name, description, startDateStr, endDateStr, visibility, singleImage]);

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
                    imageUrl={singleImage}
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
    content: { padding: 20, paddingBottom: 40 },
});