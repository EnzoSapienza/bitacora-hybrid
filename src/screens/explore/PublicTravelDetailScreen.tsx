import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExploreStackParamList } from '../../navigation/tabs/ExploreNavigator';
import { usePublicTravelStore } from '@/hooks/explore/usePublicTravelStore';
import { useAppStore } from '@/store/appStore';
import { TravelDetailContent } from '@/screens/travel/TravelDetail/TravelDetailContent';

type TravelDetailRouteProp = RouteProp<ExploreStackParamList, 'PublicTravelDetail'>;
type TravelDetailNavigationProp = NativeStackNavigationProp<ExploreStackParamList, 'PublicTravelDetail'>;

export default function PublicTravelDetailScreen() {
    const route = useRoute<TravelDetailRouteProp>();
    const navigation = useNavigation<TravelDetailNavigationProp>();
    const { travelId } = route.params;
    const colors = useAppStore((s) => s.themescolors);
    const store = usePublicTravelStore();

    useEffect(() => {
        if (travelId) store.loadDetail(travelId);
        return () => store.clearDetail();
    }, [travelId]);

    useEffect(() => {
        if (store.travel?.name) navigation.setOptions({ title: store.travel.name });
    }, [store.travel?.name]);

    if (store.isLoading || !store.travel) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    return (
        <TravelDetailContent
            travel={store.travel}
            points={store.pointsOfInterest}
            poisLoading={false}
            onPoiPress={(point) => navigation.navigate('PublicPointDetail', { travelId: store.travel!.id, pointId: point.id })}
            creatorUser={store.creatorUser}
            onCreatorPress={() => navigation.navigate('PublicProfile', { userId: store.creatorUser!.id })}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});