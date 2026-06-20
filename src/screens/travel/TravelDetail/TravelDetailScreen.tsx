import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { useTravelStore } from '@/hooks/firestore/useTravelStore';
import { usePoiStore } from '@/hooks/firestore/usePoiStore';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import AddButton from '@/components/add_button/AddButton';
import { TravelStackParamList } from '@/navigation/tabs/TravelNavigator';
import PoiList from '@/components/travel/poi_list/PoiList';
import { getTravelStatus } from '@/components/utils/date';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';

const { width } = Dimensions.get('window');

type DetailRouteProp = RouteProp<TravelStackParamList, 'TravelDetails'>;
type DetailNavProp = NativeStackNavigationProp<TravelStackParamList>;

export default function TravelDetailScreen() {
    const route = useRoute<DetailRouteProp>();
    const navigation = useNavigation<DetailNavProp>();
    const { travelId } = route.params;
    
    const colors = useAppStore((s) => s.themescolors);
    
    const travel = useTravelStore((state) => 
        state.travels.find((t) => t.id === travelId)
    );

    const { points, loading, fetchPoints } = usePoiStore();
    const [descripcionExpandida, setDescripcionExpandida] = useState(false);

    useEffect(() => {
        if (travelId) {
            fetchPoints(travelId);
        }
    }, [travelId]);

    useEffect(() => {
        if (travel?.name) {
            navigation.setOptions({
                title: travel.name,
            });
        }
    }, [travel?.name, navigation]);

    if (!travel) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <Text style={[Typography.bodyLarge, { color: colors.grisOscuro }]}>
                    No se encontró el viaje seleccionado.
                </Text>
            </View>
        );
    }

    const statusViaje = getTravelStatus(travel.startDate, travel.endDate, colors);

    const getVisibilityData = (vis: string) => {
        switch (vis?.toLowerCase()) {
            case 'public': 
                return { icon: 'public' as const, label: 'PÚBLICO' };
            case 'followers': 
                return { icon: 'people' as const, label: 'SEGUIDORES' };
            default: 
                return { icon: 'lock' as const, label: 'PRIVADO' };
        }
    };

    const visibility = getVisibilityData(travel.visibility);

    const renderHeaderContent = () => (
        <View style={styles.headerContent}>
            <View style={styles.dateRow}>
                <MaterialIcons name="calendar-today" size={14} color="#FFFFFF" style={styles.dateIcon} />
                <Text style={[Typography.labelSmall, { color: "#FFFFFF", opacity: 0.9 }]}>
                    {travel.startDate.toLocaleDateString()} — {travel.endDate.toLocaleDateString()}
                </Text>
                <View style={styles.diasChip}>
                    <Text style={[Typography.labelSmall, { color: "#FFFFFF", fontWeight: '700', fontSize: 11 }]}>
                        {travel.durationDays} {travel.durationDays === 1 ? 'DÍA' : 'DÍAS'}
                    </Text>
                </View>
            </View>
            {travel.description ? (
                descripcionExpandida ? (
                    <View style={styles.descripcionExpandidaBox}>
                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                            <Text style={[Typography.bodyMedium, { color: "#FFFFFF", opacity: 0.85 }]}>
                                {travel.description}
                            </Text>
                        </ScrollView>
                        <TouchableOpacity onPress={() => setDescripcionExpandida(false)} activeOpacity={0.7} style={styles.verMasBtn}>
                            <Text style={[Typography.labelSmall, { color: "#FFFFFF", fontWeight: '700' }]}>
                                Ver menos
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text 
                            style={[Typography.bodyMedium, { color: "#FFFFFF", marginTop: 6, opacity: 0.85 }]} 
                            numberOfLines={2}
                        >
                            {travel.description}
                        </Text>
                        {travel.description.length > 80 && (
                            <TouchableOpacity onPress={() => setDescripcionExpandida(true)} activeOpacity={0.7} style={styles.verMasBtn}>
                                <Text style={[Typography.labelSmall, { color: "#FFFFFF", fontWeight: '700' }]}>
                                    Ver más
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )
            ) : null}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.grisFondoApp }]}>
            <View style={styles.headerContainer}>
                {travel.imageUrl ? (
                    <ImageBackground 
                        source={{ uri: travel.imageUrl }} 
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                            style={styles.gradient}
                        >
                            {renderHeaderContent()}
                        </LinearGradient>
                    </ImageBackground>
                ) : (
                    <View style={styles.fallbackHeader}>
                        <ImagePlaceholder currentColors={colors} height="100%" />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.85)']}
                            style={[styles.gradient, styles.gradientOverlay]}
                        >
                            {renderHeaderContent()}
                        </LinearGradient>
                    </View>
                )}
            </View>

            <View style={styles.body}>
                <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                        <MaterialIcons name={visibility.icon} size={16} color={colors.azulProfundo} />
                        <Text style={[Typography.labelSmall, { color: colors.grisOscuro, marginLeft: 4 }]}>
                            {visibility.label}
                        </Text>
                    </View>

                    <View style={[styles.badge, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                        <Text style={[Typography.labelSmall, { color: statusViaje.color, fontWeight: '700' }]}>
                            {statusViaje.label}
                        </Text>
                    </View>

                    <View style={[styles.badge, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                        <MaterialIcons name="place" size={16} color={colors.azulProfundo} />
                        <Text style={[Typography.labelSmall, { color: colors.grisOscuro, marginLeft: 4 }]}>
                            {points.length} {points.length === 1 ? 'PUNTO' : 'PUNTOS'}
                        </Text>
                    </View>
                </View>

                <Text style={[Typography.titleMedium, { color: colors.azulOscuro, fontWeight: '700', marginBottom: 12 }]}>
                    Puntos de interés
                </Text>

                <View style={styles.poiSection}>
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="small" color={colors.azulProfundo} />
                        </View>
                    ) : points.length === 0 ? (
                        <View style={[styles.placeholderCard, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                            <MaterialIcons name="alt-route" size={28} color={colors.grisMedio} />
                            <Text style={[Typography.bodyLarge, { color: colors.grisMedio, marginTop: 8, textAlign: 'center' }]}>
                                Los puntos de interés se listarán en esta sección
                            </Text>
                        </View>
                    ) : (
                        <PoiList
                            points={points}
                            currentColors={colors}
                            onPressItem={(item) => navigation.navigate('PoiDetail', { pointId: item.id, travelId: travel.id })}
                        />
                    )}
                </View>
            </View>

            <AddButton 
                onPress={() => navigation.navigate('PointForm', { travelId: travel.id })} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { width: width, height: 200, overflow: 'hidden' },
    backgroundImage: { width: '100%', height: '100%' },
    gradient: { flex: 1, justifyContent: 'flex-end' },
    gradientOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
    headerContent: { padding: 20, paddingBottom: 16 },
    descripcionExpandidaBox: { marginTop: 6, maxHeight: 90 },
    verMasBtn: { alignSelf: 'flex-end', marginTop: 4 },
    dateRow: { flexDirection: 'row', alignItems: 'center' },
    dateIcon: { marginRight: 6 },
    diasChip: { 
        marginLeft: 8, 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 10, 
        backgroundColor: 'rgba(255,255,255,0.22)' 
    },
    fallbackHeader: { width: '100%', height: '100%', position: 'relative' },
    body: { flex: 1, padding: 16, paddingBottom: 0 },
    metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
    poiSection: { flex: 1 },
    placeholderCard: { padding: 24, paddingVertical: 40, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }
});