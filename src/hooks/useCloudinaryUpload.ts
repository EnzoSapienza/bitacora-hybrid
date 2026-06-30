import { useState } from 'react';
import { Platform } from 'react-native';

const CLOUD_NAME = 'dx3tqpadc';
const UPLOAD_PRESET = 'bitacora_preset';

export function useCloudinaryUpload() {
    const [uploading, setUploading] = useState(false);

    const uploadImage = async (fileUri: string): Promise<string | null> => {
        try {
            const data = new FormData();

            if (Platform.OS === 'web') {
                // En web el Blob real, no el objeto { uri, type, name }
                const response = await fetch(fileUri);
                const blob = await response.blob();
                data.append('file', blob, 'upload.jpg');
            } else {
                data.append('file', { uri: fileUri, type: 'image/jpeg', name: 'upload.jpg' } as any);
            }

            data.append('upload_preset', UPLOAD_PRESET);

            return await new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const result = JSON.parse(xhr.responseText);
                        resolve(result.secure_url || null);
                    } else {
                        console.error('Cloudinary error:', xhr.responseText);
                        resolve(null);
                    }
                };

                xhr.onerror = () => {
                    console.error('Error de red al subir a Cloudinary');
                    resolve(null);
                };

                xhr.send(data);
            });
        } catch (e) {
            console.error('Error preparando la imagen para subir:', e);
            return null;
        }
    };

    const uploadImages = async (fileUris: string[]): Promise<(string | null)[]> => {
        setUploading(true);
        const results = await Promise.all(fileUris.map(uploadImage));
        setUploading(false);
        return results;
    };

    return { uploadImage, uploadImages, uploading };
}