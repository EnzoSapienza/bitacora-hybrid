import { useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTranslation } from 'react-i18next';

export const useNotifications = () => {
    const { t } = useTranslation();
    const [hasPermission, setHasPermission] = useState(false);
    const avisoMostradoRef = useRef(false);

    useEffect(() => {
        solicitarPermisos();
    }, []);

    const solicitarPermisos = async () => {
        if (Platform.OS === 'web') {
            setHasPermission(false);
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        setHasPermission(finalStatus === 'granted');
    };

    const avisarSinPermiso = () => {
        if (avisoMostradoRef.current) return;
        avisoMostradoRef.current = true;
        Alert.alert(
            t('notifications.disabled_title'),
            t('notifications.disabled_message')
        );
        setTimeout(() => {
            avisoMostradoRef.current = false;
        }, 3000);
    };

    const programarAlarma = async (
        titulo: string,
        mensaje: string,
        fecha: Date,
        url?: string
    ): Promise<string | null> => {
        if (!hasPermission) {
            avisarSinPermiso();
            return null;
        }
        if (fecha.getTime() <= Date.now()) return null;

        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title: titulo,
                    body: mensaje,
                    sound: true,
                    data: url ? { url } : {},
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: fecha,
                },
            });
            return id;
        } catch (error) {
            console.log('Error al programar notificación:', error);
            return null;
        }
    };

    const programarAvisoInicioViaje = async (
        nombreViaje: string,
        startDate: Date,
        travelId: string
    ): Promise<string | null> => {
        const fecha = new Date(startDate);
        fecha.setDate(fecha.getDate() - 1);
        fecha.setHours(9, 0, 0, 0);
        return programarAlarma(
            t('notifications.start_travel_title'),
            t('notifications.start_travel_body', { nombreViaje }),
            fecha,
            `bitacorahybrid://travel/${travelId}`
        );
    };

    const programarAvisoPreparacion = async (
        nombreViaje: string,
        startDate: Date,
        travelId: string
    ): Promise<string | null> => {
        const fecha = new Date(startDate);
        fecha.setDate(fecha.getDate() - 3);
        fecha.setHours(9, 0, 0, 0);
        return programarAlarma(
            t('notifications.prep_title'),
            t('notifications.prep_body', { nombreViaje }),
            fecha,
            `bitacorahybrid://travel/${travelId}`
        );
    };

    const programarAvisoPOI = async (
        nombrePunto: string,
        fechaVisita: Date,
        travelId: string,
        poiId: string
    ): Promise<string | null> => {
        return programarAlarma(
            t('notifications.poi_title'),
            t('notifications.poi_body', { nombrePunto }),
            fechaVisita,
            `bitacorahybrid://travel/${travelId}/poi/${poiId}`
        );
    };

    const programarRecordatorioFotos = async (
        nombrePunto: string,
        fechaVisita: Date,
        travelId: string,
        poiId: string
    ): Promise<string | null> => {
        const fecha = new Date(fechaVisita);
        fecha.setHours(fecha.getHours() + 2);
        return programarAlarma(
            t('notifications.photos_title'),
            t('notifications.photos_body', { nombrePunto }),
            fecha,
            `bitacorahybrid://travel/${travelId}/poi/${poiId}`
        );
    };

    const cancelarAlarma = async (id: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
        } catch (error) {
            console.log('Error al cancelar notificación:', error);
        }
    };

    const cancelarTodas = async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.log('Error al cancelar todas las notificaciones:', error);
        }
    };

    return {
        hasPermission,
        programarAvisoInicioViaje,
        programarAvisoPreparacion,
        programarAvisoPOI,
        programarRecordatorioFotos,
        cancelarAlarma,
        cancelarTodas,
    };
};