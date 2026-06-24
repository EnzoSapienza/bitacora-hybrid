import React from "react";
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "@/store/appStore";
import { useAllPublicTravels } from "@/hooks/explore/useAllPublicTravels";
import TravelCard from "@/components/travel/travel_card/TravelCard";
import Travel from "@/types/models/travel";

export default function AllPublicTravelsScreen() {
    const navigation = useNavigation<any>();
    const colors = useAppStore((s) => s.themescolors);
    const { travels, isLoading, isLoadingMore, hasMore, loadMore } = useAllPublicTravels();

    const handlePressTravel = (travel: Travel) => {
        navigation.navigate("PublicTravelDetail", { travelId: travel.id });
    };

    if (isLoading) {
        return (
            <View style={[styles.centerContent, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    if (travels.length === 0) {
        return (
            <View style={[styles.centerContent, { backgroundColor: colors.grisFondoApp }]}>
                <Text style={{ color: colors.grisOscuro }}>
                    No hay más viajes nuevos para descubrir por ahora.
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={travels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <View style={styles.cardWrapper}>
                    <TravelCard travel={item} onPress={() => handlePressTravel(item)} />
                </View>
            )}
            onEndReached={() => hasMore && loadMore()}
            onEndReachedThreshold={0.4}
            style={[styles.container, { backgroundColor: colors.grisFondoApp }]}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
                isLoadingMore
                    ? <ActivityIndicator size="small" color={colors.azulProfundo} style={styles.loaderInline} />
                    : null
            }
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { paddingTop: 16, paddingBottom: 32 },
    cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
    loaderInline: { marginVertical: 16 },
    centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
});