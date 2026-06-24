import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTravelStore } from '@/hooks/firestore/useTravelStore';
import { usePoiStore } from '@/hooks/firestore/usePoiStore';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import { TravelStackParamList } from '@/navigation/tabs/TravelNavigator';
import { TravelDetailContent } from './TravelDetailContent';

type DetailRouteProp = RouteProp<TravelStackParamList, 'TravelDetails'>;
type DetailNavProp = NativeStackNavigationProp<TravelStackParamList>;

export default function TravelDetailScreen() {
    const route = useRoute<DetailRouteProp>();
    const navigation = useNavigation<DetailNavProp>();
    const { travelId } = route.params;
    const colors = useAppStore((s) => s.themescolors);
    const travel = useTravelStore((state) => state.travels.find((t) => t.id === travelId));
    const { points, loading, fetchPoints } = usePoiStore();

    useEffect(() => {
        if (travelId) fetchPoints(travelId);
    }, [travelId]);

    useEffect(() => {
        if (travel?.name) navigation.setOptions({ title: travel.name });
    }, [travel?.name]);

    if (!travel) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <Text style={[Typography.bodyLarge, { color: colors.grisOscuro }]}>
                    Viaje no encontrado
                </Text>
            </View>
        );
    }

    return (
        <TravelDetailContent
            travel={travel}
            points={points}
            poisLoading={loading}
            onPoiPress={(item) => navigation.navigate('PoiDetail', { pointId: item.id, travelId: travel.id })}
            onAddPoi={() => navigation.navigate('PointForm', { travelId: travel.id })}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});