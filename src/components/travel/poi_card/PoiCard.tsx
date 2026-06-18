import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Typography } from '@/constants/typography';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';

interface PoiCardProps {
    point: {
        id: string;
        name: string;
        address: string;
        visitDate: string;
        visitTime: string;
        imageUrls: string[];
    };
    currentColors: any;
    onPress: () => void;
}

const MESES_ABREVIADOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export default function PoiCard({ point, currentColors, onPress }: PoiCardProps) {
    const tieneFotos = point.imageUrls && point.imageUrls.length > 0;

    const filtrarHoraMilital = (timeStr: string) => {
        if (!timeStr) return '';
        return timeStr.replace(/[^0-9:]/g, '').trim();
    };

    const formatearFechaCorta = (fechaStr: string) => {
        if (!fechaStr) return '';
        const partes = fechaStr.split('/');
        if (partes.length !== 3) return fechaStr;
        const dia = parseInt(partes[0], 10);
        const mesIndex = parseInt(partes[1], 10) - 1;
        if (isNaN(dia) || mesIndex < 0 || mesIndex > 11) return fechaStr;
        return `${MESES_ABREVIADOS[mesIndex]} ${dia}`;
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: currentColors.blanco, borderColor: currentColors.grisClaro }]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View style={styles.imageContainer}>
                {tieneFotos ? (
                    <Image 
                        source={{ uri: point.imageUrls[0] }} 
                        style={styles.cardImage} 
                        transition={150} 
                    />
                ) : (
                    <ImagePlaceholder currentColors={currentColors} padding={24} />
                )}

                <View style={[styles.dateBadge, { backgroundColor: currentColors.blanco }]}>
                    <Text style={[Typography.labelSmall, { color: currentColors.azulProfundo, fontWeight: '700' }]}>
                        {formatearFechaCorta(point.visitDate)}
                    </Text>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={[Typography.titleMedium, { color: currentColors.grisOscuro }]} numberOfLines={1}>
                    {point.name}
                </Text>
                
                {point.address ? (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={14} color={currentColors.azulProfundo} style={styles.iconGap} />
                        <Text style={[Typography.bodyMedium, { color: currentColors.grisMedio }]} numberOfLines={1}>
                            {point.address}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.detailRow}>
                    <MaterialIcons name="access-time" size={14} color={currentColors.grisMedio} style={styles.iconGap} />
                    <Text style={[Typography.labelSmall, { color: currentColors.grisMedio }]}>
                        {filtrarHoraMilital(point.visitTime)} hs
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { 
        borderRadius: 14, 
        borderWidth: 1, 
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 150
    },
    cardImage: { 
        width: '100%', 
        height: '100%' 
    },
    dateBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2
    },
    infoContainer: { 
        padding: 14 
    },
    detailRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 6 
    },
    iconGap: { 
        marginRight: 4 
    }
});