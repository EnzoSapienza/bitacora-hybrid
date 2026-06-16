import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image'; // El motor tipo Coil para renderizado premium
import { Typography } from '../../../constants/typography';
import { DatePickerField } from '../../../components/utils/DatePickerField';
import { Dispatch, SetStateAction } from 'react';

interface TravelFormContentProps {
    theme: 'light' | 'dark';
    currentColors: any;
    name: string;
    setName: (text: string) => void;
    description: string;
    setDescription: (text: string) => void;
    startDateStr: string;
    setStartDateStr: (text: string) => void;
    endDateStr: string;
    setEndDateStr: (text: string) => void;
    visibility: 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS';
    setVisibility: Dispatch<SetStateAction<'PRIVATE' | 'PUBLIC' | 'FOLLOWERS'>>;
    imageUrl: string | null;
    setImageUrl: Dispatch<SetStateAction<string | null>>;
    dateError: string | null;
}

export function TravelFormContent({
    currentColors,
    name,
    setName,
    description,
    setDescription,
    startDateStr,
    setStartDateStr,
    endDateStr,
    setEndDateStr,
    visibility,
    setVisibility,
    imageUrl,
    setImageUrl,
    dateError,
}: TravelFormContentProps) {

    const seleccionarDeGaleria = async () => {
        const statusPermiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!statusPermiso.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const tomarFoto = async () => {
        const statusPermiso = await Camera.requestCameraPermissionsAsync();
        if (!statusPermiso.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setImageUrl(result.assets[0].uri);
        }
    };

    const handleAgregarPortada = () => {
        Alert.alert(
            'Seleccionar Foto de Portada',
            '¿Desde dónde querés cargar la imagen de tu viaje?',
            [
                { text: 'Galería de fotos', onPress: seleccionarDeGaleria },
                { text: 'Tomar fotografía', onPress: tomarFoto },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    return (
        <View style={styles.container}> 
            {imageUrl ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={imageUrl}
                        style={styles.previewImage}
                        transition={200}  
                    />
                    <TouchableOpacity
                        style={[styles.removeButton, { backgroundColor: currentColors.rojoPin }]}
                        onPress={() => setImageUrl(null)}
                    >
                        <Text style={[Typography.labelLarge, { color: '#FFFFFF' }]}>Eliminar Foto</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.uploadContainer,
                        {
                            backgroundColor: currentColors.blanco,
                            borderColor: '#8E8E93'
                        }
                    ]}
                    onPress={handleAgregarPortada}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="photo-camera" size={38} color={currentColors.grisMedio} style={{ marginBottom: 8 }} />
                    <Text style={[Typography.bodyLarge, { color: currentColors.grisMedio, fontWeight: '600' }]}>
                        Agregar foto de portada
                    </Text>
                </TouchableOpacity>
            )}
            
            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 24 }]}>
                Nombre del Viaje
            </Text>
            <TextInput
                style={[styles.input, { backgroundColor: currentColors.blanco, color: currentColors.grisOscuro, borderColor: currentColors.grisClaro }]}
                placeholder="Nombre"
                placeholderTextColor={currentColors.grisMedio}
                maxLength={100}
                value={name}
                onChangeText={setName}
            />
            
            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 16 }]}>
                Descripción
            </Text>
            <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: currentColors.blanco, color: currentColors.grisOscuro, borderColor: currentColors.grisClaro }]}
                placeholder="Descripción"
                placeholderTextColor={currentColors.grisMedio}
                multiline
                numberOfLines={4}
                maxLength={300}
                value={description}
                onChangeText={setDescription}
            />
            <Text style={[styles.charCounter, { color: currentColors.grisMedio }]}>
                {description.length} / 300
            </Text>

            {/* FECHAS REUTILIZABLES CON CALENDARIO */}
            <View style={[styles.row, { marginTop: 8 }]}>
                <DatePickerField
                    label="Fecha Inicio"
                    value={startDateStr}
                    onChangeText={setStartDateStr}
                    currentColors={currentColors}
                />
                <View style={{ width: 12 }} />
                <DatePickerField
                    label="Fecha Fin"
                    value={endDateStr}
                    onChangeText={setEndDateStr}
                    currentColors={currentColors}
                />
            </View>

            {dateError && (
                <Text style={[Typography.labelSmall, { color: currentColors.rojoPin, marginTop: 6, fontWeight: '500' }]}>
                    {dateError}
                </Text>
            )}
            
            <Text style={[Typography.labelLarge, { color: currentColors.azulOscuro, marginBottom: 8, marginTop: 16 }]}>
                Visibilidad del Viaje
            </Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[
                        styles.selectorButton,
                        {
                            backgroundColor: visibility === 'PRIVATE' ? currentColors.azulProfundo : currentColors.blanco,
                            borderColor: visibility === 'PRIVATE' ? currentColors.azulProfundo : currentColors.grisClaro
                        }
                    ]}
                    onPress={() => setVisibility('PRIVATE')}
                >
                    <View style={styles.buttonInnerRow}>
                        <MaterialIcons name="lock" size={16} color={visibility === 'PRIVATE' ? currentColors.blanco : currentColors.azulProfundo} />
                        <Text style={[Typography.labelSmall, { color: visibility === 'PRIVATE' ? currentColors.blanco : currentColors.azulProfundo, marginLeft: 6 }]}>
                            Privado
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.selectorButton,
                        {
                            backgroundColor: visibility === 'FOLLOWERS' ? currentColors.azulProfundo : currentColors.blanco,
                            borderColor: visibility === 'FOLLOWERS' ? currentColors.azulProfundo : currentColors.grisClaro,
                            marginLeft: 8
                        }
                    ]}
                    onPress={() => setVisibility('FOLLOWERS')}
                >
                    <View style={styles.buttonInnerRow}>
                        <MaterialIcons name="people" size={16} color={visibility === 'FOLLOWERS' ? currentColors.blanco : currentColors.azulProfundo} />
                        <Text style={[Typography.labelSmall, { color: visibility === 'FOLLOWERS' ? currentColors.blanco : currentColors.azulProfundo, marginLeft: 6 }]}>
                            Amigos
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.selectorButton,
                        {
                            backgroundColor: visibility === 'PUBLIC' ? currentColors.azulProfundo : currentColors.blanco,
                            borderColor: visibility === 'PUBLIC' ? currentColors.azulProfundo : currentColors.grisClaro,
                            marginLeft: 8
                        }
                    ]}
                    onPress={() => setVisibility('PUBLIC')}
                >
                    <View style={styles.buttonInnerRow}>
                        <MaterialIcons name="public" size={16} color={visibility === 'PUBLIC' ? currentColors.blanco : currentColors.azulProfundo} />
                        <Text style={[Typography.labelSmall, { color: visibility === 'PUBLIC' ? currentColors.blanco : currentColors.azulProfundo, marginLeft: 6 }]}>
                            Público
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    input: { borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1 },
    textArea: { height: 100, textAlignVertical: 'top' },
    charCounter: { textAlign: 'right', fontSize: 11, marginTop: 4, marginRight: 4 },
    row: { flexDirection: 'row' },
    selectorButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    buttonInnerRow: { flexDirection: 'row', alignItems: 'center' },
    uploadContainer: { width: '100%', height: 160, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: 20, marginTop: 4 },
    imageContainer: { width: '100%', alignItems: 'center' },
    previewImage: { width: '100%', height: 180, borderRadius: 8 },
    removeButton: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
});