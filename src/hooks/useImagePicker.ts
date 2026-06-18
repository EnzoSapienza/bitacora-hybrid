import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

export function useImagePicker(multiple = true) {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const seleccionarDeGaleria = async () => {
        const statusPermiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!statusPermiso.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para añadir fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: multiple,
            allowsEditing: !multiple,
            aspect: !multiple ? [16, 9] : undefined,
            quality: 0.6,
        });

        if (!result.canceled && result.assets) {
            const uris = result.assets.map(asset => asset.uri);
            if (multiple) {
                setSelectedImages(prev => [...prev, ...uris]);
            } else {
                setSelectedImages([uris[0]]);
            }
        }
    };

    const tomarFoto = async () => {
        const statusPermiso = await Camera.requestCameraPermissionsAsync();
        if (!statusPermiso.granted) {
            Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotografías.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            allowsEditing: !multiple,
            aspect: !multiple ? [16, 9] : undefined,
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            if (multiple) {
                setSelectedImages(prev => [...prev, result.assets[0].uri]);
            } else {
                setSelectedImages([result.assets[0].uri]);
            }
        }
    };

    const handlePickImages = () => {
        Alert.alert(
            '¿Desde dónde quieres cargar la imagen?',
            '',
            [
                { text: 'Galería de fotos', onPress: seleccionarDeGaleria },
                { text: 'Tomar fotografía', onPress: tomarFoto },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleRemovePhoto = (uriToRemove: string) => {
        setSelectedImages(prev => prev.filter(uri => uri !== uriToRemove));
    };

    const singleImage = selectedImages[0] ?? null;
    const setSingleImage = (uri: string | null) => {
        setSelectedImages(uri ? [uri] : []);
    };

    return {
        selectedImages,
        singleImage,
        setSingleImage,
        handlePickImages,
        handleRemovePhoto,
    };
}