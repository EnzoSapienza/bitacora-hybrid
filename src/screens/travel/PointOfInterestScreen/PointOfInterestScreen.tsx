import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePoiStore } from '@/hooks/firestore/usePoiStore';
import { useTheme } from '@/context/ThemeContext';
import { Typography } from '@/constants/typography';
import { TravelStackParamList } from '@/navigation/tabs/TravelNavigator';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';

const { width } = Dimensions.get('window');

type PoiDetailRouteProp = RouteProp<TravelStackParamList, 'PoiDetail'>;

export default function PointOfInterestScreen() {
    const route = useRoute<PoiDetailRouteProp>();
    const navigation = useNavigation();
    const { pointId } = route.params;

    const { colors } = useTheme();

    const point = usePoiStore((state) =>
        state.points.find((p) => p.id === pointId)
    );
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (point?.name) {
            navigation.setOptions({
                title: point.name,
            });
        }
    }, [navigation, point?.name]);

    if (!point) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <Text style={[Typography.bodyLarge, { color: colors.grisOscuro }]}>
                    No se encontró la información del punto de interés
                </Text>
            </View>
        );
    }

    const tieneFotos = point.imageUrls && point.imageUrls.length > 0;

    const filtrarHoraMilital = (timeStr: string) => {
        if (!timeStr) return '';
        return timeStr.replace(/[^0-9:]/g, '').trim();
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveIndex(index);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.grisFondoApp }]} bounces={false}>
            <View style={[styles.imageContainer, { borderBottomWidth: tieneFotos ? 0 : 1, borderColor: colors.grisClaro }]}>
                {tieneFotos ? (
                    <View style={styles.carouselWrapper}>
                        <FlatList
                            data={point.imageUrls}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            renderItem={({ item }) => (
                                <View style={styles.carouselImageContainer}>
                                    <Image
                                        source={{ uri: item }}
                                        style={styles.mainImage}
                                        contentFit="cover"
                                        transition={150}
                                    />
                                </View>
                            )}
                        />
                        {point.imageUrls.length > 1 && (
                            <View style={styles.indicatorContainer}>
                                {point.imageUrls.map((_, index) => (
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
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="calendar-month" size={16} color={colors.grisMedio} style={styles.iconStyle} />
                        <Text style={[Typography.bodyMedium, { color: colors.grisOscuro }]}>
                            {point.visitDate}
                        </Text>
                    </View>
                    <Text style={[Typography.bodyMedium, { color: colors.grisMedio, marginHorizontal: 8 }]} />
                    <View style={styles.infoItem}>
                        <MaterialIcons name="access-time" size={16} color={colors.grisMedio} style={styles.iconStyle} />
                        <Text style={[Typography.bodyMedium, { color: colors.grisOscuro }]}>
                            {filtrarHoraMilital(point.visitTime)} hs
                        </Text>
                    </View>
                </View>

                {point.address ? (
                    <View style={[styles.addressContainer, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                        <MaterialIcons name="location-on" size={18} color={colors.azulProfundo} style={{ marginRight: 8 }} />
                        <Text style={[Typography.bodyMedium, { color: colors.grisOscuro, flex: 1 }]} numberOfLines={2}>
                            {point.address}
                        </Text>
                    </View>
                ) : null}

                <Text style={[Typography.titleMedium, { color: colors.azulOscuro, fontWeight: '700', marginTop: 24, marginBottom: 8 }]}>
                    Ubicación
                </Text>
                <View style={[styles.mapPlaceholder, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                    <MaterialIcons name="map" size={32} color={colors.grisMedio} />
                    <Text style={[Typography.labelSmall, { color: colors.grisMedio, marginTop: 6, fontWeight: '600' }]}>
                        [ MAPA FIJO - COORDENADAS: {point.latitude}, {point.longitude} ]
                    </Text>
                </View>

                <Text style={[Typography.labelLarge, { color: colors.grisMedio, marginTop: 24, marginBottom: 8 }]}>
                    Notas
                </Text>
                <View style={[styles.notesBox, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                    <MaterialIcons
                        name="format-quote"
                        size={48}
                        color={colors.azulProfundo}
                        style={styles.quoteIcon}
                    />
                    <Text
                        style={[
                            Typography.bodyMedium,
                            {
                                color: colors.grisOscuro,
                                lineHeight: 20,
                                fontStyle: point.notes ? 'italic' : 'normal'
                            }
                        ]}
                    >
                        {point.notes || ""}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
    imageContainer: { width: width, height: 220, overflow: 'hidden' },
    carouselWrapper: { width: width, height: 220, position: 'relative' },
    carouselImageContainer: { width: width, height: 220 },
    mainImage: { width: '100%', height: '100%' },
    body: { flex: 1, padding: 20, paddingBottom: 40 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    infoItem: { flexDirection: 'row', alignItems: 'center' },
    iconStyle: { marginRight: 6 },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.01,
        shadowRadius: 2,
        elevation: 1
    },
    indicatorContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        gap: 6,
    },
    indicator: {
        height: 6,
        borderRadius: 3,
    },
    indicatorActive: {
        width: 14,
    },
    indicatorInactive: {
        width: 6,
    },
    mapPlaceholder: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
    },
    notesBox: { padding: 16, paddingTop: 28, borderRadius: 12, borderWidth: 1, position: 'relative', overflow: 'hidden' },
    quoteIcon: { position: 'absolute', top: -6, left: 8, opacity: 0.12 },
});