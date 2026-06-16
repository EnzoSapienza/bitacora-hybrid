import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { parse, isValid, startOfDay, endOfDay } from 'date-fns';
import { useTravelStore } from '../../../hooks/firestore/useTravelStore';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { useCloudinaryUpload } from '../../../hooks/useCloudinaryUpload';
import { Typography } from '../../../constants/typography';
import { TravelFormContent } from './TravelFormContent';

export default function TravelFormScreen() {
    const navigation = useNavigation();
    const { theme, colors } = useTheme();
    const { user } = useAuth();
    const { addTravel, loading: storeLoading, error } = useTravelStore();
    const { uploadImage, uploading } = useCloudinaryUpload();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDateStr, setStartDateStr] = useState('');
    const [endDateStr, setEndDateStr] = useState('');
    const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC' | 'FOLLOWERS'>('PRIVATE');
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const baseStartDate = startDateStr ? parse(startDateStr, 'dd/MM/yyyy', new Date()) : null;
    const baseEndDate = endDateStr ? parse(endDateStr, 'dd/MM/yyyy', new Date()) : null;

    const isStartDateValid = baseStartDate && isValid(baseStartDate);
    const isEndDateValid = baseEndDate && isValid(baseEndDate);

    let dateError: string | null = null;
    if (isStartDateValid && isEndDateValid) {
        if (startOfDay(baseStartDate!) > endOfDay(baseEndDate!)) {
            dateError = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
        }
    }

    const isFormValid =
        name.trim().length > 0 &&
        isStartDateValid &&
        isEndDateValid &&
        !dateError &&
        user?.uid;

    const handleSave = async () => {
        if (!isFormValid || !baseStartDate || !baseEndDate) return;

        const finalStartDate = startOfDay(baseStartDate);
        const finalEndDate = endOfDay(baseEndDate);

        try {
            let remoteUrl = null;

            if (imageUrl) {
                remoteUrl = await uploadImage(imageUrl);
                if (!remoteUrl) {
                    alert('No se pudo subir la imagen de portada. Por favor intentá de nuevo.');
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
                durationDays: Math.ceil((finalEndDate.getTime() - finalStartDate.getTime()) / (1000 * 60 * 60 * 24)) || 1,
                imageUrl: remoteUrl,
                privileges: [],
                updatedAt: new Date(),
            });

            navigation.goBack();
        } catch (err) {
            // error manejado por el store
        }
    };

    const estaCargando = storeLoading || uploading;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.grisFondoApp }]}
            contentContainerStyle={styles.content}
        >
            <TravelFormContent
                theme={theme}
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
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                dateError={dateError}
            />

            {error && (
                <Text style={[Typography.bodyMedium, { color: colors.rojoPin, marginTop: 12, textAlign: 'center' }]}>
                    {error}
                </Text>
            )}

            <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: isFormValid && !estaCargando ? colors.azulProfundo : colors.grisMedio }]}
                onPress={handleSave}
                disabled={!isFormValid || estaCargando}
            >
                {estaCargando ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={[Typography.labelLarge, { color: colors.blanco }]}>Crear Viaje</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    saveButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
});