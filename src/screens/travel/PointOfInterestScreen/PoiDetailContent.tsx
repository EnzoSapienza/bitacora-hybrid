import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';
import { formatDateLocalized, formatTimeLocalized } from '@/components/utils/date';

const { width } = Dimensions.get('window');

interface PoiDetailContentProps {
    name: string;
    address?: string;
    notes?: string;
    visitDate?: Date | null;
    latitude?: number;
    longitude?: number;
    imageUrls?: string[];
}

export const PoiDetailContent = ({
    name, address, notes, visitDate, latitude, longitude, imageUrls = []
}: PoiDetailContentProps) => {
    const colors = useAppStore((s) => s.themescolors);
    const { i18n, t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(0);
    const tieneFotos = imageUrls.length > 0;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.grisFondoApp }]} bounces={false}>
            <View style={[styles.imageContainer, { borderBottomWidth: tieneFotos ? 0 : 1, borderColor: colors.grisClaro }]}>
                {tieneFotos ? (
                    <View style={styles.carouselWrapper}>
                        <FlatList
                            data={imageUrls}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, index) => index.toString()}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            renderItem={({ item }) => (
                                <View style={styles.carouselImageContainer}>
                                    <Image source={{ uri: item }} style={styles.mainImage} contentFit="cover" transition={150} />
                                </View>
                            )}
                        />
                        {imageUrls.length > 1 && (
                            <View style={styles.indicatorContainer}>
                                {imageUrls.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.indicator,
                                            index === activeIndex
                                                ? [styles.indicatorActive, { backgroundColor: colors.blanco }]
                                                : [styles.indicatorInactive, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                ) : (
                    <ImagePlaceholder currentColors={colors} height={220} />
                )}
            </View>

            <View style={styles.body}>
                {visitDate && (
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="calendar-month" size={16} color={colors.grisMedio} style={styles.iconStyle} />
                            <Text style={[Typography.bodyMedium, { color: colors.grisOscuro }]}>
                                {formatDateLocalized(visitDate, i18n.language)}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <MaterialIcons name="access-time" size={16} color={colors.grisMedio} style={styles.iconStyle} />
                            <Text style={[Typography.bodyMedium, { color: colors.grisOscuro }]}>
                                {formatTimeLocalized(visitDate, i18n.language)}
                            </Text>
                        </View>
                    </View>
                )}

                {address ? (
                    <View style={[styles.addressContainer, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                        <MaterialIcons name="location-on" size={18} color={colors.azulProfundo} style={{ marginRight: 8 }} />
                        <Text style={[Typography.bodyMedium, { color: colors.grisOscuro, flex: 1 }]} numberOfLines={2}>
                            {address}
                        </Text>
                    </View>
                ) : null}

                {latitude != null && longitude != null && (
                    <>
                        <Text style={[Typography.titleMedium, { color: colors.azulOscuro, fontWeight: '700', marginTop: 24, marginBottom: 8 }]}>
                            {t('travel.poiForm.locationLabel')}
                        </Text>
                        <View style={[styles.mapPlaceholder, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                            <MaterialIcons name="map" size={32} color={colors.grisMedio} />
                            <Text style={[Typography.labelSmall, { color: colors.grisMedio, marginTop: 6, fontWeight: '600' }]}>
                                [ MAPA FIJO - COORDENADAS: {latitude}, {longitude} ]
                            </Text>
                        </View>
                    </>
                )}

                <Text style={[Typography.labelLarge, { color: colors.grisMedio, marginTop: 24, marginBottom: 8 }]}>
                    {t('travel.poiForm.notesLabel')}
                </Text>
                <View style={[styles.notesBox, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                    <MaterialIcons name="format-quote" size={48} color={colors.azulProfundo} style={styles.quoteIcon} />
                    <Text style={[Typography.bodyMedium, { color: colors.grisOscuro, lineHeight: 20, fontStyle: notes ? 'italic' : 'normal' }]}>
                        {notes || ''}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    imageContainer: { width, height: 220, overflow: 'hidden' },
    carouselWrapper: { width, height: 220, position: 'relative' },
    carouselImageContainer: { width, height: 220 },
    mainImage: { width: '100%', height: '100%' },
    body: { flex: 1, padding: 20, paddingBottom: 40 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
    infoItem: { flexDirection: 'row', alignItems: 'center' },
    iconStyle: { marginRight: 6 },
    addressContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginTop: 2, elevation: 1 },
    indicatorContainer: { flexDirection: 'row', position: 'absolute', bottom: 12, alignSelf: 'center', gap: 6 },
    indicator: { height: 6, borderRadius: 3 },
    indicatorActive: { width: 14 },
    indicatorInactive: { width: 6 },
    mapPlaceholder: { width: '100%', height: 160, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 16, elevation: 3 },
    notesBox: { padding: 16, paddingTop: 28, borderRadius: 12, borderWidth: 1, position: 'relative', overflow: 'hidden' },
    quoteIcon: { position: 'absolute', top: -6, left: 8, opacity: 0.12 },
});