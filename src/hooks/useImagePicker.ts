import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import * as ImageManipulator from 'expo-image-manipulator';


export function useImagePicker(multiple = true) {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const { t } = useTranslation();

    const seleccionarDeGaleria = async () => {
        let permission = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                Alert.alert(
                    t('imagePicker.permissions.title'),
                    t('imagePicker.permissions.galleryConfig'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('imagePicker.permissions.openSettings'), onPress: () => Linking.openSettings() },
                    ]
                );
            } else {
                Alert.alert(
                    t('imagePicker.permissions.title'),
                    t('imagePicker.permissions.galleryWarning')
                );
            }
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsMultipleSelection: multiple,
                allowsEditing: !multiple,
                aspect: !multiple ? [16, 9] : undefined,
                quality: 0.6,
            });

            if (!result.canceled && result.assets) {
                const uris = result.assets.map(a => a.uri);
                setSelectedImages(prev => multiple ? [...prev, ...uris] : [uris[0]]);
            }
        } catch {
            Alert.alert(t('imagePicker.errors.title'), t('imagePicker.errors.gallery'));
        }
    };

    const tomarFoto = async () => {
        let permission = await ImagePicker.getCameraPermissionsAsync();

        if (!permission.granted) {
            permission = await ImagePicker.requestCameraPermissionsAsync();
        }

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                Alert.alert(
                    t('imagePicker.permissions.title'),
                    t('imagePicker.permissions.cameraConfig'),
                    [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('imagePicker.permissions.openSettings'), onPress: () => Linking.openSettings() },
                    ]
                );
            } else {
                Alert.alert(
                    t('imagePicker.permissions.title'),
                    t('imagePicker.permissions.cameraWarning')
                );
            }
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: !multiple,
                aspect: !multiple ? [16, 9] : undefined,
                quality: 0.6,
            });

            if (!result.canceled && result.assets[0]?.uri) {
                const manipulado = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 1280 } }],
                    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
                );
                setSelectedImages(prev => multiple ? [...prev, manipulado.uri] : [manipulado.uri]);
            }
        } catch (error: any) {
            console.log('Error cámara:', JSON.stringify(error));
            Alert.alert(t('imagePicker.errors.title'), t('imagePicker.errors.camera'));
        }
    };

    const handlePickImages = () => {
        Alert.alert(
            t('imagePicker.source.title'),
            '',
            [
                { text: t('imagePicker.source.gallery'), onPress: seleccionarDeGaleria },
                { text: t('imagePicker.source.camera'), onPress: tomarFoto },
                { text: t('common.cancel'), style: 'cancel' },
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

    return { selectedImages, singleImage, setSingleImage, handlePickImages, handleRemovePhoto };
}