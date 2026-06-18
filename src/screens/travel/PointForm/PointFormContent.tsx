import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Typography } from '@/constants/typography';

interface PointFormContentProps {
    currentColors: any;
    name: string;
    setName: (text: string) => void;
    address: string;
    setAddress: (text: string) => void;
    notes: string;
    setNotes: (text: string) => void;
    visitDate: Date;
    setVisitDate: (date: Date) => void;
    visitTime: Date;
    setVisitTime: (date: Date) => void;
    capturedCoords: { lat: number; lng: number } | null;
    handleCaptureLocation: () => void;
    selectedImages: string[];
    handlePickImages: () => void;
    handleRemovePhoto: (uri: string) => void;
    resolvingAddress: boolean;
    isFechaInvalida: boolean;
    rangoTexto: string;
}

export function PointFormContent({
    currentColors,
    name,
    setName,
    address,
    setAddress,
    notes,
    setNotes,
    visitDate,
    setVisitDate,
    visitTime,
    setVisitTime,
    capturedCoords,
    handleCaptureLocation,
    selectedImages,
    handlePickImages,
    handleRemovePhoto,
    resolvingAddress,
    isFechaInvalida,
    rangoTexto,
}: PointFormContentProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setVisitDate(selectedDate);
        }
    };

    const onChangeTime = (event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setVisitTime(selectedTime);
        }
    };

    const notesLength = (notes || '').length;

    return (
        <View style={styles.container}>
            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 8 }]}>
                Nombre del lugar
            </Text>
            <TextInput
                style={[
                    styles.input, 
                    { backgroundColor: currentColors.blanco, color: currentColors.grisOscuro, borderColor: currentColors.grisClaro }
                ]}
                placeholder="Ej. Hotel Central, Resto Bar..."
                placeholderTextColor={currentColors.grisMedio}
                maxLength={100}
                value={name}
                onChangeText={setName}
            />

            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 16 }]}>
                Dirección
            </Text>
            <TextInput
                style={[
                    styles.input, 
                    { backgroundColor: currentColors.blanco, color: currentColors.grisOscuro, borderColor: currentColors.grisClaro }
                ]}
                placeholder="Calle, número, ciudad..."
                placeholderTextColor={currentColors.grisMedio}
                maxLength={150}
                value={address}
                onChangeText={setAddress}
            />

            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 16 }]}>
                Ubicación Geográfica
            </Text>
            <View style={styles.rowGap}>
                <TouchableOpacity
                    style={[
                        styles.halfButton,
                        {
                            backgroundColor: currentColors.blanco,
                            borderColor: capturedCoords ? currentColors.azulProfundo : currentColors.grisClaro
                        }
                    ]}
                    onPress={handleCaptureLocation}
                    disabled={resolvingAddress}
                    activeOpacity={0.7}
                >
                    {resolvingAddress ? (
                        <ActivityIndicator size="small" color={currentColors.azulProfundo} style={{ marginRight: 6 }} />
                    ) : (
                        <MaterialIcons 
                            name={capturedCoords ? "location-on" : "my-location"} 
                            size={20} 
                            color={capturedCoords ? currentColors.azulProfundo : currentColors.grisMedio} 
                            style={{ marginRight: 6 }} 
                        />
                    )}
                    <Text style={[Typography.bodyMedium, { color: capturedCoords ? currentColors.azulProfundo : currentColors.grisMedio, fontWeight: '600' }]}>
                        {resolvingAddress ? "Buscando..." : "Mi ubicación"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.halfButton,
                        { backgroundColor: currentColors.blanco, borderColor: currentColors.grisClaro, opacity: 0.6 }
                    ]}
                    activeOpacity={1}
                >
                    <MaterialIcons name="map" size={20} color={currentColors.grisMedio} style={{ marginRight: 6 }} />
                    <Text style={[Typography.bodyMedium, { color: currentColors.grisMedio, fontWeight: '600' }]}>
                        Ver en el mapa
                    </Text>
                </TouchableOpacity>
            </View>

            {!capturedCoords && (
                <Text style={[Typography.labelSmall, { color: currentColors.grisMedio, marginTop: 6, fontWeight: '500' }]}>
                    * Confirma la ubicación para guardar el punto de interés.
                </Text>
            )}

            <View style={[styles.rowGap, { marginTop: 16 }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8 }]}>
                        Fecha de visita
                    </Text>
                    <TouchableOpacity
                        style={[styles.input, styles.pickerTrigger, { backgroundColor: currentColors.blanco, borderColor: currentColors.grisClaro }]}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ color: currentColors.grisOscuro, fontSize: 16 }}>
                            {visitDate.toLocaleDateString()}
                        </Text>
                        <MaterialIcons name="calendar-today" size={18} color={currentColors.grisMedio} />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={visitDate}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8 }]}>
                        Hora de visita
                    </Text>
                    <TouchableOpacity
                        style={[styles.input, styles.pickerTrigger, { backgroundColor: currentColors.blanco, borderColor: currentColors.grisClaro }]}
                        onPress={() => setShowTimePicker(true)}
                    >
                        <Text style={{ color: currentColors.grisOscuro, fontSize: 16 }}>
                            {visitTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </Text>
                        <MaterialIcons name="access-time" size={18} color={currentColors.grisMedio} />
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            value={visitTime}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onChangeTime}
                        />
                    )}
                </View>
            </View>

            {rangoTexto ? (
                <Text style={[Typography.labelSmall, { color: currentColors.grisMedio, marginTop: 6, fontWeight: '500' }]}>
                    Fechas disponibles del viaje: {rangoTexto}
                </Text>
            ) : null}

            {isFechaInvalida && (
                <Text style={[Typography.labelSmall, { color: currentColors.rojoPin, marginTop: 4, fontWeight: '600' }]}>
                    La fecha seleccionada se encuentra fuera del rango de este viaje.
                </Text>
            )}

            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 16 }]}>
                Notas
            </Text>
            <TextInput
                style={[
                    styles.input, 
                    styles.textArea, 
                    { 
                        backgroundColor: currentColors.blanco, 
                        color: currentColors.grisOscuro, 
                        borderColor: notesLength >= 300 ? currentColors.rojoPin : currentColors.grisClaro 
                    }
                ]}
                placeholder="¿Qué quieres recordar de este lugar?"
                placeholderTextColor={currentColors.grisMedio}
                multiline
                numberOfLines={4}
                maxLength={300}
                value={notes}
                onChangeText={setNotes}
            />
            <Text 
                style={[
                    Typography.labelSmall, 
                    styles.charCounter, 
                    { color: notesLength >= 280 ? currentColors.rojoPin : currentColors.grisMedio }
                ]}
            >
                {notesLength} / 300
            </Text>

            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 12 }]}>
                Fotos del Lugar
            </Text>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.galleryContainer}
            >
                <TouchableOpacity
                    style={[styles.addPhotoButton, { backgroundColor: currentColors.blanco, borderColor: currentColors.grisClaro }]}
                    onPress={handlePickImages}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="photo-camera" size={24} color={currentColors.grisMedio} />
                    <Text style={[Typography.labelSmall, { color: currentColors.grisMedio, fontWeight: '600', marginTop: 2 }]}>Añadir</Text>
                </TouchableOpacity>

                {selectedImages.map((uri, index) => (
                    <View key={index} style={[styles.photoItemContainer, { borderColor: currentColors.grisClaro }]}>
                        <Image source={{ uri }} style={styles.photoItem} transition={150} />
                        <TouchableOpacity
                            style={[styles.removePhotoBadge, { backgroundColor: currentColors.grisOscuroAzulado }]}
                            onPress={() => handleRemovePhoto(uri)}
                        >
                            <MaterialIcons name="close" size={14} color={currentColors.grisFondoApp} />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    input: { borderRadius: 8, padding: 12, borderWidth: 1 },
    textArea: { height: 100, textAlignVertical: 'top' },
    charCounter: { textAlign: 'right', marginTop: 4, marginRight: 4 },
    rowGap: { flexDirection: 'row', gap: 12 },
    halfButton: { flex: 1, height: 48, borderRadius: 8, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
    pickerTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 50 },
    galleryContainer: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
    addPhotoButton: { width: 80, height: 80, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    photoItemContainer: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative', borderWidth: 1 },
    photoItem: { width: '100%', height: '100%' },
    removePhotoBadge: { position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', opacity: 0.85 }
});