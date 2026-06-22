import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { parse, isValid, startOfDay, endOfDay } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTravelStore } from '../../../hooks/firestore/useTravelStore';
import { useAuth } from '../../../hooks/useAuth'; 
import { useAppStore } from '../../../store/appStore';
import { useCloudinaryUpload } from '../../../hooks/useCloudinaryUpload';
import { useImagePicker } from '../../../hooks/useImagePicker';
import { Typography } from '../../../constants/typography';
import { calcDurationDays } from '@/components/utils/date';
import { TravelFormContent } from './TravelFormContent';

export default function TravelFormScreen() {
    const navigation = useNavigation();
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { user } = useAuth();
    const { addTravel, loading: storeLoading, error } = useTravelStore();
    const { uploadImage, uploading } = useCloudinaryUpload();
    const { singleImage, handlePickImages } = useImagePicker(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDateStr, setStartDateStr] = useState('');
    const [endDateStr, setEndDateStr] = useState('');
    const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'FOLLOWERS'>('PRIVATE');

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
        if (!isFormValid || !baseStartDate || !baseEndDate) return;

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

            await addTravel({
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

            navigation.goBack();
        } catch {
            // error manejado por el store
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
});