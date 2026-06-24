import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ExploreStackParamList } from '../../navigation/tabs/ExploreNavigator';
import { usePublicPointStore } from '@/hooks/explore/usePublicPointStore';
import { PoiDetailContent } from '@/screens/travel/PointOfInterestScreen/PoiDetailContent';

type PointDetailRouteProp = RouteProp<ExploreStackParamList, 'PublicPointDetail'>;

export default function PublicPointDetailScreen() {
    const route = useRoute<PointDetailRouteProp>();
    const navigation = useNavigation();
    const { travelId, pointId } = route.params;
    const store = usePublicPointStore();

    useEffect(() => {
        if (travelId && pointId) store.loadPoint(travelId, pointId);
        return () => store.clearPoint();
    }, [travelId, pointId]);

    useEffect(() => {
        if (store.point?.name) navigation.setOptions({ title: store.point.name });
    }, [store.point?.name]);

    if (store.isLoading || !store.point) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007BFF" />
            </View>
        );
    }

    const { point } = store;

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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});