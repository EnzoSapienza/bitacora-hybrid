import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { usePoiStore } from "@/hooks/firestore/usePoiStore";
import { useAppStore } from "@/store/appStore";
import { Typography } from "@/constants/typography";
import { TravelStackParamList } from "@/navigation/tabs/TravelNavigator";
import { PoiDetailContent } from "@/screens/travel/PointOfInterestScreen/PoiDetailContent";
import { useCommentStore } from "@/hooks/firestore/useCommentStore";
import { useAuthStore } from "@/store/authStore";

type PoiDetailRouteProp = RouteProp<TravelStackParamList, "PoiDetail">;

export default function PointOfInterestScreen() {
    const route = useRoute<PoiDetailRouteProp>();
    const navigation = useNavigation();
    const { travelId, pointId } = route.params;
    const colors = useAppStore((s) => s.themescolors);
    const { user } = useAuthStore();
    const point = usePoiStore((state) =>
        state.points.find((p) => p.id === pointId),
    );

    const {
        comments,
        loadingComments,
        errorComments,
        fetchComments,
        addComment,
        addReply,
        likeComment,
        unlikeComment,
    } = useCommentStore();
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (point?.name) navigation.setOptions({ title: point.name });
    }, [point?.name]);

    useEffect(() => {
        if (travelId && pointId) fetchComments(travelId, pointId);
    }, [travelId, pointId]);

    if (!point) {
        return (
            <View
                style={[
                    styles.center,
                    { backgroundColor: colors.grisFondoApp },
                ]}
            >
                <Text
                    style={[Typography.bodyLarge, { color: colors.grisOscuro }]}
                >
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
            comments={{
                comments,
                loadingComments,
                errorComments,
                onAddComment: async (content) => {
                    if (!travelId || !pointId || !user?.uid) {
                        return;
                    }

                    await addComment(travelId, pointId, user.uid, content);
                },
                onAddReply: async (content, commentId) => {
                    if (!travelId || !pointId || !user?.uid) {
                        return;
                    }

                    await addReply(
                        travelId,
                        pointId,
                        user.uid,
                        commentId,
                        content,
                    );
                },
                onLike: async (commentId: string) => {
                    if (!travelId || !pointId || !user?.uid) return;
                    await likeComment(travelId, pointId, commentId);
                },
                onUnlike: async (commentId: string) => {
                    if (!travelId || !pointId || !user?.uid) return;
                    await unlikeComment(travelId, pointId, commentId);
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
