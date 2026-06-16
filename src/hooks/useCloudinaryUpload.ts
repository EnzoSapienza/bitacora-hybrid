import { useState } from 'react';

const CLOUD_NAME = 'dx3tqpadc';
const UPLOAD_PRESET = 'bitacora_preset';

export function useCloudinaryUpload() {
    const [uploading, setUploading] = useState(false);

    const uploadImage = (fileUri: string): Promise<string | null> => {
        return new Promise((resolve) => {
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

            const data = new FormData();
            data.append('file', { uri: fileUri, type: 'image/jpeg', name: 'upload.jpg' } as any);
            data.append('upload_preset', UPLOAD_PRESET);

            xhr.send(data);
        });
    };

    const uploadImages = async (fileUris: string[]): Promise<(string | null)[]> => {
        setUploading(true);
        const results = await Promise.all(fileUris.map(uploadImage));
        setUploading(false);
        return results;
    };

    return { uploadImage, uploadImages, uploading };
}