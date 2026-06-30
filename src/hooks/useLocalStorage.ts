import AsyncStorage from '@react-native-async-storage/async-storage';

export const guardarIdNotificacion = async (key: string, notificationId: string) => {
    try {
        await AsyncStorage.setItem(`noti_${key}`, notificationId);
    } catch (e) {
        console.error('Error guardando ID:', e);
    }
};

export const obtenerIdNotificacion = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(`noti_${key}`);
    } catch (e) {
        console.error('Error leyendo ID:', e);
        return null;
    }
};

export const eliminarIdNotificacion = async (key: string) => {
    try {
        await AsyncStorage.removeItem(`noti_${key}`);
    } catch (e) {
        console.error('Error borrando ID:', e);
    }
};

// Keys armadas para no repetir el sufijo a mano en cada pantalla
export const NotiKeys = {
    poiVisita: (poiId: string) => `poi_visita_${poiId}`,
    poiFotos: (poiId: string) => `poi_fotos_${poiId}`,
    travelInicio: (travelId: string) => `travel_inicio_${travelId}`,
    travelPrep: (travelId: string) => `travel_prep_${travelId}`,
};