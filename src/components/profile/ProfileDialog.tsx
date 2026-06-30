import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, Button, HelperText, Dialog } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/firestore/userService';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { useAppStore } from '@/store/appStore';
import { TouchableOpacity, Image } from 'react-native';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';
import { MaterialIcons } from '@expo/vector-icons';

type ProfileDialogProps = {
    visible: boolean;
    hideDialog: () => void;
    user: {
        uid: string;
        nombre?: string;
        username?: string;
        bio?: string;
        photoUrl?: string;
    };
    onSave: (updated: { nombre: string; username: string; photoUrl: string; bio: string }) => void;
};

export const ProfileDialog = ({ visible, hideDialog, user, onSave }: ProfileDialogProps) => {
    const { t } = useTranslation();
    const colors = useAppStore((s) => s.themescolors);

    const [nombre, setNombre] = useState(user.nombre ?? '');
    const [username, setUsername] = useState(user.username ?? '');
    const [bio, setBio] = useState(user.bio ?? '');
    const [photoUrl, setPhotoUrl] = useState(user.photoUrl ?? '');
    const [loading, setLoading] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);

    useEffect(() => {
        setNombre(user.nombre ?? '');
        setUsername(user.username ?? '');
        setBio(user.bio ?? '');
        setPhotoUrl(user.photoUrl ?? '');
    }, [user.uid, visible]);

    const { singleImage, handlePickImages, dialog: pickerDialog, hideDialog: hidePickerDialog } = useImagePicker(false);
    const { uploadImage } = useCloudinaryUpload();

    useEffect(() => {
        if (!singleImage) return;
        const subir = async () => {
            setLoading(true);
            const url = await uploadImage(singleImage);
            if (url) setPhotoUrl(url);
            setLoading(false);
        };
        subir();
    }, [singleImage]);

    const handleSave = async () => {
        const usernameRegex = /^[a-z0-9_]{3,}$/;
        if (!usernameRegex.test(username.toLowerCase())) {
            setUsernameError(t('profile.usernameInvalid'));
            return;
        }

        if (username.toLowerCase() !== (user.username ?? '').toLowerCase()) {
            const available = await userService.isUsernameAvailable(username.trim());
            if (!available) {
                setUsernameError(t('profile.usernameTaken'));
                return;
            }
        }

        setLoading(true);
        try {
            await userService.updateProfile(user.uid, {
                nombre,
                username: username.toLowerCase(),
                photoUrl,
                bio,
            });
            onSave({ nombre, username, photoUrl, bio });
            hideDialog();
        } catch (e) {
            console.error('Error al guardar perfil', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={hideDialog}
                contentContainerStyle={[styles.sheet, { backgroundColor: colors.blanco }]}
            >
                {/* Barrita de arrastre visual */}
                <View style={styles.dragBarContainer}>
                    <View style={[styles.dragBar, { backgroundColor: colors.grisClaro }]} />
                </View>

                {/* Foto de perfil */}
                <TouchableOpacity onPress={handlePickImages} disabled={loading} style={styles.avatarContainer}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.avatar} />
                    ) : (
                        <ImagePlaceholder
                            currentColors={colors}
                            height={100}
                            padding={16}
                        />
                    )}
                    <View style={styles.cameraOverlay}>
                        <MaterialIcons name="photo-camera" size={16} color="white" />
                    </View>
                </TouchableOpacity>

                <TextInput
                    label={t('profile.name')}
                    value={nombre}
                    onChangeText={setNombre}
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label={t('profile.username')}
                    value={username}
                    onChangeText={(text) => { setUsername(text); setUsernameError(null); }}
                    mode="outlined"
                    autoCapitalize="none"
                    error={!!usernameError}
                    style={styles.input}
                />
                {usernameError && (
                    <HelperText type="error">{usernameError}</HelperText>
                )}
                <TextInput
                    label={t('profile.bio')}
                    value={bio}
                    onChangeText={setBio}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                />

                <View style={styles.actions}>
                    <Button onPress={hideDialog} disabled={loading}>{t('common.cancel')}</Button>
                    <Button mode="contained" onPress={handleSave} loading={loading} disabled={loading}>{t('common.save')}</Button>
                </View>
            </Modal>

            {/* Dialog del picker */}
            <Dialog visible={pickerDialog.visible} onDismiss={hidePickerDialog}>
                <Dialog.Title>{pickerDialog.title}</Dialog.Title>
                {pickerDialog.message ? (
                    <Dialog.Content>
                        <HelperText type="info">{pickerDialog.message}</HelperText>
                    </Dialog.Content>
                ) : null}
                <Dialog.Actions>
                    {pickerDialog.actions.map((action, idx) => (
                        <Button key={idx} onPress={action.onPress}>{action.label}</Button>
                    ))}
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    dragBarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    dragBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        borderWidth: 2,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
        cameraOverlay: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    cameraIcon: {
        width: 14,
        height: 14,
    },
    input: { marginBottom: 8 },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
});