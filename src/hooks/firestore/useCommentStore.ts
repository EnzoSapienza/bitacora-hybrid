import { commentService } from "@/services/firestore/commentService";
import Comment from "@/types/models/comment";
import { create } from "zustand"
import { useAuthStore } from '@/store/authStore';

interface CommentState {
    comments: Comment[];
    loadingComments: boolean;
    errorComments: string | null;
    fetchComments: (tripId: string, pointId: string) => Promise<void>;
    addComment: (tripId: string, pointId: string, userId: string, content: string) => Promise<void>;
    addReply: (tripId: string, pointId: string, userId: string, commentId: string, content: string) => Promise<void>;
    likeComment: (tripId: string, pointId: string, commentId: string) => Promise<void>;
    unlikeComment: (tripId: string, pointId: string, commentId: string) => Promise<void>;
    deleteComment: (tripId: string, pointId: string, commentId: string) => Promise<void>;
    deleteReply: (tripId: string, pointId: string, commentId: string, replyId: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set, get) => ({
    comments: [],
    loadingComments: false,
    errorComments: null,

    fetchComments: async (tripId: string, pointId: string) => {
        set({ loadingComments: true, errorComments: null });

        try {
            const data = await commentService.getCommentsByPoiId(tripId, pointId);
            set({ loadingComments: false, comments: data as Comment[] });
        } catch (err: any) {
            set({ errorComments: err.message || "Error al cargar los comentarios", loadingComments: false });
        }
    },

    addComment: async (tripId: string, pointId: string, userId: string, content: string) => {
        set({ loadingComments: true, errorComments: null });

        try {
            await commentService.addComment(tripId, pointId, userId, content);
            await get().fetchComments(tripId, pointId);
        } catch (err: any) {
            set({ errorComments: err.message || "Error al añadir comentario", loadingComments: false });
            throw err;
        }
    },

    addReply: async (tripId: string, pointId: string, userId: string, commentId: string, content: string) => {
        set({ loadingComments: true, errorComments: null });

        try {
            await commentService.addReply(tripId, pointId, userId, commentId, content);
            await get().fetchComments(tripId, pointId);
        } catch (err: any) {
            set({ errorComments: err.message || "Error al añadir la respuesta", loadingComments: false });
            throw err;
        }
    },

    likeComment: async (tripId: string, pointId: string, commentId: string) => {
        // optimistic local update: modify comments immediately, call service afterwards
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) throw new Error('Usuario no autenticado');

        const previousComments = get().comments;

        const updateCommentsRec = (comments: Comment[]): Comment[] =>
            comments.map((c) => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        likesCount: (c.likesCount ?? 0) + 1,
                        likedByCurrentUser: true,
                    };
                }

                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateCommentsRec(c.replies) };
                }

                return c;
            });

        set({ comments: updateCommentsRec(previousComments), errorComments: null });

        try {
            await commentService.addLike(tripId, pointId, commentId, userId);
        } catch (err: any) {
            // rollback
            set({ comments: previousComments, errorComments: err.message || "Error al dar like" });
            throw err;
        }
    },

    unlikeComment: async (tripId: string, pointId: string, commentId: string) => {
        // optimistic local update: modify comments immediately, call service afterwards
        const userId = useAuthStore.getState().user?.uid;
        if (!userId) throw new Error('Usuario no autenticado');

        const previousComments = get().comments;

        const updateCommentsRec = (comments: Comment[]): Comment[] =>
            comments.map((c) => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        likesCount: Math.max(0, (c.likesCount ?? 0) - 1),
                        likedByCurrentUser: false,
                    };
                }

                if (c.replies && c.replies.length > 0) {
                    return { ...c, replies: updateCommentsRec(c.replies) };
                }

                return c;
            });

        set({ comments: updateCommentsRec(previousComments), errorComments: null });

        try {
            await commentService.removeLike(tripId, pointId, commentId, userId);
        } catch (err: any) {
            // rollback
            set({ comments: previousComments, errorComments: err.message || "Error al quitar like" });
            throw err;
        }
    },
    deleteComment: async (tripId: string, pointId: string, commentId: string) => {
    const previousComments = get().comments;
    
    // Eliminación recursiva del comentario padre y sus hijos
    const removeRecursive = (comments: Comment[]): Comment[] => {
        return comments
            .filter((c) => c.id !== commentId)
            .map((c) => ({
                ...c,
                replies: c.replies ? removeRecursive(c.replies) : []
            }));
    };

    set({ comments: removeRecursive(previousComments) });

    try {
        await commentService.deleteComment(tripId, pointId, commentId);
    } catch (err) {
        set({ comments: previousComments });
        throw err;
    }
},

    deleteReply: async (tripId: string, pointId: string, commentId: string, replyId: string) => {
        const previousComments = get().comments;
        
        //borrar una respuesta
        const removeReply = (comments: Comment[]): Comment[] => {
            return comments.map((c) => {
                if (c.id === commentId) {
                    return { 
                        ...c, 
                        replies: c.replies.filter(r => r.id !== replyId) 
                    };
                }
                // Seguimos buscando en caso de que la estructura sea anidada
                return { 
                    ...c, 
                    replies: c.replies ? removeReply(c.replies) : [] 
                };
            });
        };

        set({ comments: removeReply(previousComments) });

        try {
            await commentService.deleteReply(tripId, pointId, commentId, replyId);
        } catch (err) {
            set({ comments: previousComments });
            throw err;
        }
    }
}));