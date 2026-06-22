import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Typography } from '@/constants/typography';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';
import { formatTimeLocalized, formatShortBadgeDate } from '@/components/utils/date';

interface PoiCardProps {
    point: {
        id: string;
        name: string;
        address: string;
        visitDate: Date | null;
        imageUrls: string[];
    };
    currentColors: any;
    onPress: () => void;
}

export default function PoiCard({ point, currentColors, onPress }: PoiCardProps) {
    const { t, i18n } = useTranslation();
    const tieneFotos = point.imageUrls && point.imageUrls.length > 0;

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
                        {point.visitDate ? formatShortBadgeDate(point.visitDate, t) : ''}
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
                        {point.visitDate ? formatTimeLocalized(point.visitDate, i18n.language) : ''}
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