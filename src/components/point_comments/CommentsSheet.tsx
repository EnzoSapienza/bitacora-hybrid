import PointComment from "@/components/point_comments/CommentItem";
import { Colors } from "@/constants/colors";
import Comment from "@/types/models/comment";
import { useAppStore } from "@/store/appStore";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    KeyboardEvent,
    Platform,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";
import { useTranslation } from "react-i18next";

export interface CommentsProps {
    comments?: Comment[];
    loadingComments?: boolean;
    errorComments?: null | string;
    onAddComment?: (content: string) => Promise<void> | void;
    onAddReply?: (content: string, commentId: string) => Promise<void> | void;
    onLike?: (commentId: string) => Promise<void> | void;
    onUnlike?: (commentId: string) => Promise<void> | void;
    style?: StyleProp<ViewStyle>;
}

export default function CommentsSheet({
    comments,
    errorComments,
    loadingComments,
    onAddComment,
    onAddReply,
    onLike,
    onUnlike,
    style,
}: CommentsProps) {
    const resolvedTheme = useAppStore((state) => state.resolvedTheme);
    const safeComments = comments ?? [];
    const [draft, setDraft] = useState("");
    const [replyingToCommentId, setReplyingToCommentId] = useState<
        string | null
    >(null);
    const [replyingToUserName, setReplyingToUserName] = useState<string | null>(
        null,
    );
    const [submitting, setSubmitting] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        const handleKeyboardShow = (event: KeyboardEvent) => {
            setKeyboardHeight(event.endCoordinates.height);
        };
        const handleKeyboardHide = () => {
            setKeyboardHeight(0);
        };

        const showSubscription = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
            handleKeyboardShow,
        );
        const hideSubscription = Keyboard.addListener(
            Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
            handleKeyboardHide,
        );

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const containerBackground =
        resolvedTheme === "dark"
            ? Colors.negroAzulado
            : Colors.grisOscuroAzulado;
    const textColor = Colors.blanco;
    const secondaryTextColor =
        resolvedTheme === "dark" ? Colors.grisClaro : Colors.grisMedio;

    const { t } = useTranslation();

    const handleSubmit = async () => {
        const trimmedContent = draft.trim();

        if (!trimmedContent || submitting) {
            return;
        }

        setSubmitting(true);

        try {
            if (replyingToCommentId) {
                await onAddReply?.(trimmedContent, replyingToCommentId);
            } else {
                await onAddComment?.(trimmedContent);
            }

            setDraft("");
            setReplyingToCommentId(null);
            setReplyingToUserName(null);
        } catch (error) {
            console.error("Error submitting comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    const placeholderText = replyingToCommentId
        ? t("travel.poi_comments.replyPlaceholder")
        : t("travel.poi_comments.writeComment");

    const submitLabel = replyingToCommentId
        ? t("travel.poi_comments.reply")
        : t("travel.poi_comments.send");

    if (loadingComments && !submitting) {
        return (
            <View
                style={[
                    styles.container,
                    style,
                    { backgroundColor: containerBackground, height: 320 },
                ]}
            >
                <Text style={[styles.stateText, { color: textColor }]}>
                    {t("travel.poi_comments.loading")}
                </Text>
            </View>
        );
    }

    if (errorComments) {
        return (
            <View
                style={[
                    styles.container,
                    style,
                    { backgroundColor: containerBackground, height: 320 },
                ]}
            >
                <Text style={[styles.stateText, { color: textColor }]}>
                    Error: {errorComments}
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                style,
                {
                    backgroundColor: containerBackground,
                    bottom:
                        keyboardHeight > 0
                            ? Math.max(keyboardHeight - 50, 0)
                            : 0,
                    paddingBottom: keyboardHeight > 0 ? 12 : 24,
                },
            ]}
        >
            <View style={styles.handle} />
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: textColor }]}>
                    {t("travel.poi_comments.title")}
                </Text>
                <Text style={[styles.count, { color: secondaryTextColor }]}>
                    {safeComments.length}
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
                style={styles.keyboardAvoidingContainer}
            >
                <View style={styles.contentWrapper}>
                    <FlatList
                        data={safeComments}
                        keyExtractor={(comment) => comment.id}
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <Text
                                style={[
                                    styles.emptyText,
                                    { color: secondaryTextColor },
                                ]}
                            >
                                {t("travel.poi_comments.empty")}
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <View style={styles.commentGroup}>
                                <PointComment
                                    comment={item}
                                    userName={item.userName}
                                    photoUrl={item.photoUrl}
                                    onLike={() => onLike?.(item.id)}
                                    onUnlike={() => onUnlike?.(item.id)}
                                    isLiked={!!item.likedByCurrentUser}
                                />

                                <Pressable
                                    onPress={() => {
                                        setReplyingToCommentId(item.id);
                                        setReplyingToUserName(item.userName);
                                        setDraft("");
                                    }}
                                    style={styles.replyAction}
                                >
                                    <Text style={{ color: secondaryTextColor }}>
                                        {t("travel.poi_comments.reply")}
                                    </Text>
                                </Pressable>

                                {(item.replies ?? []).length > 0 && (
                                    <View style={styles.repliesContainer}>
                                        {item.replies?.map((reply) => (
                                            <PointComment
                                                key={reply.id}
                                                comment={reply}
                                                userName={reply.userName}
                                                photoUrl={reply.photoUrl}
                                                isReply
                                                onLike={() =>
                                                    onLike?.(reply.id)
                                                }
                                                onUnlike={() =>
                                                    onUnlike?.(reply.id)
                                                }
                                                isLiked={
                                                    !!reply.likedByCurrentUser
                                                }
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    />

                    <View style={styles.inputContainer}>
                        {replyingToCommentId ? (
                            <View style={styles.replyingBanner}>
                                <Text style={{ color: textColor }}>
                                    {t("travel.poi_comments.replyingTo")}{" "}
                                    {replyingToUserName}
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        setReplyingToCommentId(null);
                                        setReplyingToUserName(null);
                                    }}
                                >
                                    <Text style={{ color: Colors.azulClaro }}>
                                        {t("common.cancel")}
                                    </Text>
                                </Pressable>
                            </View>
                        ) : null}

                        <View style={styles.inputRow}>
                            <TextInput
                                value={draft}
                                onChangeText={setDraft}
                                placeholder={placeholderText}
                                placeholderTextColor={secondaryTextColor}
                                multiline
                                editable={!submitting}
                                style={[
                                    styles.input,
                                    {
                                        color: textColor,
                                        borderColor: secondaryTextColor,
                                    },
                                ]}
                                onSubmitEditing={handleSubmit}
                                returnKeyType="send"
                            />
                            <Pressable
                                onPress={handleSubmit}
                                disabled={!draft.trim() || submitting}
                                style={[
                                    styles.submitButton,
                                    (!draft.trim() || submitting) &&
                                        styles.submitButtonDisabled,
                                ]}
                            >
                                <Text style={styles.submitButtonText}>
                                    {submitting ? "..." : submitLabel}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "80%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        paddingHorizontal: 16,
        paddingBottom: 24,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
        elevation: 10,
    },
    handle: {
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignSelf: "center",
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        flexShrink: 1,
        flexWrap: "wrap",
        lineHeight: 24,
    },
    count: {
        fontSize: 15,
        flexShrink: 0,
    },
    keyboardAvoidingContainer: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 8,
        flexGrow: 1,
    },
    commentGroup: {
        marginBottom: 10,
    },
    replyAction: {
        alignSelf: "flex-start",
        marginTop: 6,
        marginLeft: 2,
    },
    repliesContainer: {
        marginLeft: 24,
        marginTop: 6,
    },
    inputContainer: {
        marginTop: 8,
        gap: 8,
    },
    replyingBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 96,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    submitButton: {
        minHeight: 44,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.azulProfundo,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: Colors.blanco,
        fontWeight: "600",
    },
    emptyText: {
        textAlign: "center",
        paddingVertical: 20,
    },
    stateText: {
        textAlign: "center",
        paddingVertical: 20,
    },
});
