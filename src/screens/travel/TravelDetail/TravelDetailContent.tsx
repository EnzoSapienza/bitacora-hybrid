import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import AddButton from '@/components/add_button/AddButton';
import PoiList from '@/components/travel/poi_list/PoiList';
import ImagePlaceholder from '@/components/common/ImagePlaceholder';
import { getTravelStatus } from '@/components/utils/date';
import Travel from '@/types/models/travel';
import { CreatorInfo } from '@/components/profile/CreatorInfo';

const { width } = Dimensions.get('window');

interface CreatorUser {
    id: string;
    username?: string;
    nombre?: string;
    photoUrl?: string;
}

interface TravelDetailContentProps {
    travel: Travel;
    points: any[];
    poisLoading: boolean;
    onPoiPress: (point: any) => void;
    onAddPoi?: () => void;
    creatorUser?: CreatorUser | null;
    onCreatorPress?: () => void;
}

export const TravelDetailContent = ({
    travel, points, poisLoading,
    onPoiPress, onAddPoi,
    creatorUser, onCreatorPress,
}: TravelDetailContentProps) => {
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const [descripcionExpandida, setDescripcionExpandida] = useState(false);

    const statusViaje = getTravelStatus(travel.startDate, travel.endDate, colors, t);

    const getVisibilityData = (vis: string) => {
        switch (vis?.toLowerCase()) {
            case 'public': return { icon: 'public' as const, label: t('travel.visibility.public') };
            case 'followers': return { icon: 'people' as const, label: t('travel.visibility.followers') };
            default: return { icon: 'lock' as const, label: t('travel.visibility.private') };
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
                        {travel.durationDays} {t('travel.days', { count: travel.durationDays })}
                    </Text>
                </View>
            </View>
            {travel.description ? (
                descripcionExpandida ? (
                    <View style={styles.descripcionExpandidaBox}>
                        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                            <Text style={[Typography.bodyMedium, { color: "#FFFFFF", opacity: 0.85 }]}>
                                {travel.description}
                            </Text>
                        </ScrollView>
                        <TouchableOpacity onPress={() => setDescripcionExpandida(false)} activeOpacity={0.7} style={styles.verMasBtn}>
                            <Text style={[Typography.labelSmall, { color: "#FFFFFF", fontWeight: '700' }]}>
                                {t('travel.seeLess')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={[Typography.bodyMedium, { color: "#FFFFFF", marginTop: 6, opacity: 0.85 }]} numberOfLines={2}>
                            {travel.description}
                        </Text>
                        {travel.description.length > 80 && (
                            <TouchableOpacity onPress={() => setDescripcionExpandida(true)} activeOpacity={0.7} style={styles.verMasBtn}>
                                <Text style={[Typography.labelSmall, { color: "#FFFFFF", fontWeight: '700' }]}>
                                    {t('travel.seeMore')}
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
            {/* Header con imagen */}
            <View style={styles.headerContainer}>
                {travel.imageUrl ? (
                    <ImageBackground source={{ uri: travel.imageUrl }} style={styles.backgroundImage} resizeMode="cover">
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.gradient}>
                            {renderHeaderContent()}
                        </LinearGradient>
                    </ImageBackground>
                ) : (
                    <View style={styles.fallbackHeader}>
                        <ImagePlaceholder currentColors={colors} height="100%" />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={[styles.gradient, styles.gradientOverlay]}>
                            {renderHeaderContent()}
                        </LinearGradient>
                    </View>
                )}
            </View>

            <View style={styles.body}>
                {/* Badges */}
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
                            {points.length} {t('travel.points', { count: points.length })}
                        </Text>
                    </View>
                </View>

                {/* Tarjeta creador — solo vista publica */}
                {creatorUser && onCreatorPress && (
                    <CreatorInfo
                        nombre={creatorUser.nombre || 'Viajero'}
                        username={creatorUser.username || 'usuario'}
                        photoUrl={creatorUser.photoUrl}
                        onPress={onCreatorPress}
                    />
                )}

                <Text style={[Typography.titleMedium, { color: colors.azulOscuro, fontWeight: '700', marginBottom: 12 }]}>
                    {t('travel.poi')}
                </Text>

                <View style={styles.poiSection}>
                    {poisLoading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="small" color={colors.azulProfundo} />
                        </View>
                    ) : points.length === 0 ? (
                        <View style={[styles.placeholderCard, { backgroundColor: colors.blanco, borderColor: colors.grisClaro }]}>
                            <MaterialIcons name="alt-route" size={28} color={colors.grisMedio} />
                            <Text style={[Typography.bodyLarge, { color: colors.grisMedio, marginTop: 8, textAlign: 'center' }]}>
                                {t('travel.poiEmptyPlaceholder')}
                            </Text>
                        </View>
                    ) : (
                        <PoiList
                            points={points}
                            currentColors={colors}
                            onPressItem={onPoiPress}
                        />
                    )}
                </View>
            </View>

            {/* Botón agregar — solo vista privada */}
            {onAddPoi && <AddButton onPress={onAddPoi} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { width, height: 200, overflow: 'hidden' },
    backgroundImage: { width: '100%', height: '100%' },
    gradient: { flex: 1, justifyContent: 'flex-end' },
    gradientOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
    headerContent: { padding: 20, paddingBottom: 16 },
    descripcionExpandidaBox: { marginTop: 6, maxHeight: 90 },
    verMasBtn: { alignSelf: 'flex-end', marginTop: 4 },
    dateRow: { flexDirection: 'row', alignItems: 'center' },
    dateIcon: { marginRight: 6 },
    diasChip: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)' },
    fallbackHeader: { width: '100%', height: '100%', position: 'relative' },
    body: { flex: 1, padding: 16, paddingBottom: 0 },
    metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
    poiSection: { flex: 1 },
    placeholderCard: { padding: 24, paddingVertical: 40, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
});