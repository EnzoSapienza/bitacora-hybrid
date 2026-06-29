import { Colors } from "@/constants/colors";
import Comment from "@/types/models/comment";
import { useAppStore } from "@/store/appStore";
import { Image, StyleSheet, Text, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

type Props = {
    comment: Comment;
    userName: string;
    photoUrl: string;
    isReply?: boolean;
    isLiked?: boolean;
    onLike?: (commentId: string) => void | Promise<void>;
    onUnlike?: (commentId: string) => void | Promise<void>;
};

export default function CommentItem({
    comment,
    userName,
    photoUrl,
    isReply = false,
    isLiked = false,
    onLike,
    onUnlike,
}: Props) {
    const currentColors = useAppStore((state) => state.themescolors);
    const avatarInitial = (userName || "U").trim().charAt(0).toUpperCase();
    const { t } = useTranslation();
    const timestampText = comment.timestamp
        ? new Date(comment.timestamp).toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
          })
        : t("common.now");

    return (
        <View
            style={[
                styles.card,
                isReply && styles.replyCard,
                {
                    backgroundColor: currentColors?.blanco ?? Colors.blanco,
                    borderColor: currentColors?.grisClaro ?? Colors.grisClaro,
                },
            ]}
        >
            {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
                <View
                    style={[
                        styles.avatarPlaceholder,
                        {
                            backgroundColor:
                                currentColors?.azulClaro ?? Colors.azulClaro,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.avatarText,
                            {
                                color:
                                    currentColors?.azulOscuro ??
                                    Colors.azulOscuro,
                            },
                        ]}
                    >
                        {avatarInitial}
                    </Text>
                </View>
            )}

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text
                        style={[
                            styles.userName,
                            {
                                color:
                                    currentColors?.grisOscuroAzulado ??
                                    Colors.grisOscuroAzulado,
                            },
                        ]}
                    >
                        {userName}
                    </Text>
                    <Text
                        style={[
                            styles.timestamp,
                            {
                                color:
                                    currentColors?.grisMedio ??
                                    Colors.grisMedio,
                            },
                        ]}
                    >
                        {timestampText}
                    </Text>
                </View>

                <Text
                    style={[
                        styles.commentText,
                        {
                            color:
                                currentColors?.grisOscuro ?? Colors.grisOscuro,
                        },
                    ]}
                >
                    {comment.content}
                </Text>

                <Text
                    style={[
                        styles.metaText,
                        {
                            color:
                                currentColors?.azulProfundo ??
                                Colors.azulProfundo,
                        },
                    ]}
                >
                    {comment.likesCount} {t("common.like")}
                </Text>
            </View>

            <Pressable
                onPress={() => {
                    if (isLiked) {
                        onUnlike?.(comment.id);
                    } else {
                        onLike?.(comment.id);
                    }
                }}
                style={styles.likeButton}
            >
                <MaterialIcons
                    name={isLiked ? "favorite" : "favorite-border"}
                    size={20}
                    color={
                        isLiked
                            ? Colors.rojoPin
                            : (currentColors?.azulProfundo ??
                              Colors.azulProfundo)
                    }
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
    },
    replyCard: {
        marginTop: 6,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    avatarPlaceholder: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontWeight: "700",
    },
    contentContainer: {
        flex: 1,
        minWidth: 0,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
        gap: 8,
        flexWrap: "wrap",
    },
    userName: {
        fontWeight: "700",
        fontSize: 15,
        flexShrink: 1,
        flexWrap: "wrap",
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        flexShrink: 0,
    },
    commentText: {
        fontSize: 15,
        lineHeight: 22,
        flexShrink: 1,
    },
    metaText: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: "600",
    },
    likeButton: {
        padding: 8,
        alignSelf: "center",
    },
});
