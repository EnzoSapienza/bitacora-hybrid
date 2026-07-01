import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { usePoiStore } from "@/hooks/firestore/usePoiStore";
import { useAppStore } from "@/store/appStore";
import { Typography } from "@/constants/typography";
import { TravelStackParamList } from "@/navigation/tabs/TravelNavigator";
import { PoiDetailContent } from "@/screens/travel/PointOfInterestScreen/PoiDetailContent";
import { useCommentStore } from "@/hooks/firestore/useCommentStore";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

type PoiDetailRouteProp = RouteProp<TravelStackParamList, "PoiDetail">;
type PointNavProv = NativeStackNavigationProp<TravelStackParamList>;

export default function PointOfInterestScreen() {
    const route = useRoute<PoiDetailRouteProp>();
    const navigation = useNavigation<PointNavProv>();
    const { travelId, pointId } = route.params;
    const colors = useAppStore((s) => s.themescolors);
    const { user } = useAuthStore();

    const { points, loading, fetchPoints } = usePoiStore();
    const point = points.find((p) => p.id === pointId);

    const { t } = useTranslation();

    const {
        comments,
        loadingComments,
        errorComments,
        fetchComments,
        addComment,
        addReply,
        likeComment,
        unlikeComment,
        deleteComment,
        deleteReply,
    } = useCommentStore();
    
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (travelId && points.length === 0) {
            fetchPoints(travelId);
        }
    }, [travelId]);

    useEffect(() => {
        if (point?.name) navigation.setOptions({ title: point.name });
    }, [point?.name]);

    useEffect(() => {
        if (point)
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        style={{ marginRight: 10 }}
                        onPress={() =>
                            navigation.navigate("PointEdit", {
                                travelId,
                                pointId,
                            })
                        }
                    >
                        <MaterialIcons
                            name="edit"
                            size={24}
                            color={colors.grisOscuro}
                        />
                    </TouchableOpacity>
                ),
            });
    }, []);

    useEffect(() => {
        if (travelId && pointId) fetchComments(travelId, pointId);
    }, [travelId, pointId]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <ActivityIndicator size="large" color={colors.azulProfundo} />
            </View>
        );
    }

    if (!point) {
        return (
            <View style={[styles.center, { backgroundColor: colors.grisFondoApp }]}>
                <Text style={[Typography.bodyLarge, { color: colors.grisOscuro }]}>
                    {t("travel.poiNotFound")}
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
            comments={{
                comments,
                loadingComments,
                errorComments,
                onAddComment: async (content) => {
                    if (!travelId || !pointId || !user?.uid) return;
                    await addComment(travelId, pointId, user.uid, content);
                },
                onAddReply: async (content, commentId) => {
                    if (!travelId || !pointId || !user?.uid) return;
                    await addReply(travelId, pointId, user.uid, commentId, content);
                },
                onLike: async (commentId: string) => {
                    if (!travelId || !pointId || !user?.uid) return;
                    await likeComment(travelId, pointId, commentId);
                },
                onUnlike: async (commentId: string) => {
                    if (!travelId || !pointId || !user?.uid) return;
                    await unlikeComment(travelId, pointId, commentId);
                },
                onDeleteComment: async (messageId: string, parentId?: string) => {
                    if (!travelId || !pointId) return;
                    
                    if (parentId) {
                        // Borrado de respuesta
                        await deleteReply(travelId, pointId, parentId, messageId);
                    } else {
                        // Borrado de comentario raíz
                        await deleteComment(travelId, pointId, messageId);
                    }
                },
            }}
            showComments={showComments}
            setShowComments={setShowComments}
        />
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 80,
    },
});