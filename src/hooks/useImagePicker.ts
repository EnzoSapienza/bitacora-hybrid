import { useState } from 'react';
import { Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import * as ImageManipulator from 'expo-image-manipulator';

type DialogState = {
    visible: boolean;
    title: string;
    message?: string;
    actions: { label: string; onPress?: () => void; style?: 'cancel' | 'default' }[];
};

const DIALOG_HIDDEN: DialogState = {
    visible: false,
    title: '',
    message: '',
    actions: [],
};

export function useImagePicker(multiple = true) {
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [dialog, setDialog] = useState<DialogState>(DIALOG_HIDDEN);
    const { t } = useTranslation();

    const hideDialog = () => setDialog(DIALOG_HIDDEN);

    const showDialog = (config: Omit<DialogState, 'visible'>) => {
        setDialog({ visible: true, ...config });
    };

    const seleccionarDeGaleria = async () => {
        let permission = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                showDialog({
                    title: t('imagePicker.permissions.title'),
                    message: t('imagePicker.permissions.galleryConfig'),
                    actions: [
                        { label: t('common.cancel'), style: 'cancel', onPress: hideDialog },
                        { label: t('imagePicker.permissions.openSettings'), onPress: () => { hideDialog(); Linking.openSettings(); } },
                    ],
                });
            } else {
                showDialog({
                    title: t('imagePicker.permissions.title'),
                    message: t('imagePicker.permissions.galleryWarning'),
                    actions: [{ label: t('common.cancel'), style: 'cancel', onPress: hideDialog }],
                });
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
            showDialog({
                title: t('imagePicker.errors.title'),
                message: t('imagePicker.errors.gallery'),
                actions: [{ label: t('common.cancel'), style: 'cancel', onPress: hideDialog }],
            });
        }
    };

    const tomarFoto = async () => {
        let permission = await ImagePicker.getCameraPermissionsAsync();

        if (!permission.granted) {
            permission = await ImagePicker.requestCameraPermissionsAsync();
        }

        if (!permission.granted) {
            if (!permission.canAskAgain) {
                showDialog({
                    title: t('imagePicker.permissions.title'),
                    message: t('imagePicker.permissions.cameraConfig'),
                    actions: [
                        { label: t('common.cancel'), style: 'cancel', onPress: hideDialog },
                        { label: t('imagePicker.permissions.openSettings'), onPress: () => { hideDialog(); Linking.openSettings(); } },
                    ],
                });
            } else {
                showDialog({
                    title: t('imagePicker.permissions.title'),
                    message: t('imagePicker.permissions.cameraWarning'),
                    actions: [{ label: t('common.cancel'), style: 'cancel', onPress: hideDialog }],
                });
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
            showDialog({
                title: t('imagePicker.errors.title'),
                message: t('imagePicker.errors.camera'),
                actions: [{ label: t('common.cancel'), style: 'cancel', onPress: hideDialog }],
            });
        }
    };

    const handlePickImages = () => {
        showDialog({
            title: t('imagePicker.source.title'),
            actions: [
                { label: t('imagePicker.source.gallery'), onPress: () => { hideDialog(); seleccionarDeGaleria(); } },
                { label: t('imagePicker.source.camera'), onPress: () => { hideDialog(); tomarFoto(); } },
                { label: t('common.cancel'), style: 'cancel', onPress: hideDialog },
            ],
        });
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
        dialog,
        hideDialog,
    };
}