import { Colors } from "@/constants/colors";
import Comment from "@/types/models/comment";
import { useAppStore } from "@/store/appStore";
import { Image, StyleSheet, Text, View, Pressable, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";

type Props = {
    comment: Comment;
    userName: string;
    photoUrl: string;
    isReply?: boolean;
    isLiked?: boolean;
    isOwner?: boolean;
    onLike?: (commentId: string) => void | Promise<void>;
    onUnlike?: (commentId: string) => void | Promise<void>;
    onDelete?: (commentId: string) => void | Promise<void>;
};

export default function CommentItem({
    comment,
    userName,
    photoUrl,
    isReply = false,
    isLiked = false,
    isOwner = false,
    onLike,
    onUnlike,
    onDelete,
}: Props) {
    const currentColors = useAppStore((state) => state.themescolors);
    const { t } = useTranslation();
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const avatarInitial = (userName || "U").trim().charAt(0).toUpperCase();
    const timestampText = comment.timestamp
        ? new Date(comment.timestamp).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        : t("common.now");

    return (
        <View style={[styles.card, isReply && styles.replyCard, { backgroundColor: currentColors?.blanco ?? Colors.blanco, borderColor: currentColors?.grisClaro ?? Colors.grisClaro }]}>
            {/* Avatar */}
            {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: currentColors?.azulClaro ?? Colors.azulClaro }]}>
                    <Text style={[styles.avatarText, { color: currentColors?.azulOscuro ?? Colors.azulOscuro }]}>{avatarInitial}</Text>
                </View>
            )}

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.userName, { color: currentColors?.grisOscuroAzulado ?? Colors.grisOscuroAzulado }]}>{userName}</Text>
                    
                    <View style={styles.headerRight}>
                        <Text style={[styles.timestamp, { color: currentColors?.grisMedio ?? Colors.grisMedio }]}>{timestampText}</Text>
                        
                        {isOwner && (
                            <Pressable hitSlop={8} onPress={() => setMenuOpen(true)} style={styles.menuButton}>
                                <MaterialIcons name="more-vert" size={18} color={currentColors?.grisMedio ?? Colors.grisMedio} />
                            </Pressable>
                        )}
                    </View>
                </View>

                <Text style={[styles.commentText, { color: currentColors?.grisOscuro ?? Colors.grisOscuro }]}>{comment.content}</Text>
                <Text style={[styles.metaText, { color: currentColors?.azulProfundo ?? Colors.azulProfundo }]}>
                    {comment.likesCount} {t("common.like")}
                </Text>
            </View>

            <Pressable onPress={() => isLiked ? onUnlike?.(comment.id) : onLike?.(comment.id)} style={styles.likeButton}>
                <MaterialIcons name={isLiked ? "favorite" : "favorite-border"} size={20} color={isLiked ? Colors.rojoPin : (currentColors?.azulProfundo ?? Colors.azulProfundo)} />
            </Pressable>

            {/* Menú de Opciones (Tres puntos) */}
            <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setMenuOpen(false)}>
                    <View style={[styles.menuDropdown, { backgroundColor: currentColors?.blanco ?? Colors.blanco, borderColor: currentColors?.grisClaro ?? Colors.grisClaro }]}>
                        <Pressable onPress={() => { setMenuOpen(false); setDeleteModalVisible(true); }} style={styles.menuItem}>
                            <MaterialIcons name="delete-outline" size={16} color={Colors.rojoPin} />
                            <Text style={{ color: Colors.rojoPin, marginLeft: 6 }}>{t("common.delete")}</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* Modal de Confirmacion */}
            <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.dialogBox, { backgroundColor: currentColors?.blanco ?? Colors.blanco }]}>
                        <Text style={[styles.dialogTitle, { color: currentColors?.grisOscuro ?? Colors.grisOscuro }]}>
                            {t("travel.poi_comments.deleteConfirmTitle")}
                        </Text>
                        <Text style={[styles.dialogText, { color: currentColors?.grisOscuro ?? Colors.grisOscuro }]}>
                            {t("travel.poi_comments.deleteConfirmMessage")}
                        </Text>
                        <View style={styles.dialogActions}>
                            <Pressable onPress={() => setDeleteModalVisible(false)} style={styles.actionBtn}>
                                <Text style={{ color: currentColors?.grisMedio ?? Colors.grisMedio }}>
                                    {t("common.cancel")}
                                </Text>
                            </Pressable>
                            <Pressable 
                                onPress={() => { 
                                    onDelete?.(comment.id);
                                    setDeleteModalVisible(false); 
                                }} 
                                style={styles.actionBtn}
                            >
                                <Text style={{ color: Colors.rojoPin, fontWeight: 'bold' }}>
                                    {t("common.delete")}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, padding: 12, borderWidth: 1 },
    replyCard: { marginTop: 6 },
    avatar: { width: 38, height: 38, borderRadius: 19 },
    avatarPlaceholder: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    avatarText: { fontWeight: "700" },
    contentContainer: { flex: 1, minWidth: 0 },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4, gap: 8, flexWrap: "wrap" },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
    userName: { fontWeight: "700", fontSize: 15, flexShrink: 1, lineHeight: 20 },
    timestamp: { fontSize: 12, flexShrink: 0 },
    menuButton: { padding: 4 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: 'center', justifyContent: 'center' },
    menuDropdown: { borderRadius: 8, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 10, minWidth: 130 },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 4 },
    commentText: { fontSize: 15, lineHeight: 22, flexShrink: 1 },
    metaText: { marginTop: 6, fontSize: 12, fontWeight: "600" },
    likeButton: { padding: 8, alignSelf: "center" },
    dialogBox: { width: '80%', maxWidth: 300, padding: 20, borderRadius: 12, elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } },
    dialogTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    dialogText: { marginBottom: 20, fontSize: 14 },
    dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
    actionBtn: { padding: 8 }
});