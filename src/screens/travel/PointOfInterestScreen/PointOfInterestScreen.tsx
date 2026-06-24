import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { usePoiStore } from '@/hooks/firestore/usePoiStore';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import { TravelStackParamList } from '@/navigation/tabs/TravelNavigator';
import { PoiDetailContent } from '@/screens/travel/PointOfInterestScreen/PoiDetailContent';

type PoiDetailRouteProp = RouteProp<TravelStackParamList, 'PoiDetail'>;

export default function PointOfInterestScreen() {
    const route = useRoute<PoiDetailRouteProp>();
    const navigation = useNavigation();
    const { pointId } = route.params;
    const colors = useAppStore((s) => s.themescolors);
    const point = usePoiStore((state) => state.points.find((p) => p.id === pointId));

    useEffect(() => {
        if (point?.name) navigation.setOptions({ title: point.name });
    }, [point?.name]);

    if (!point) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <Text style={[Typography.bodyLarge, { color: colors.grisOscuro }]}>
                    No se encontró la información del punto de interés
                </Text>
            </View>
        );
    }

    return (
        <PoiDetailContent
            name={point.name}
            address={point.address}
            notes={point.notes}
            visitDate={point.visitDate}
            latitude={point.latitude}
            longitude={point.longitude}
            imageUrls={point.imageUrls}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
});