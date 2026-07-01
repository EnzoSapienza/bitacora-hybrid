import { db } from "../firebase";
import {
    collection,
    doc,
    getDocs,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
    writeBatch
} from 'firebase/firestore';
import { setDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';

export const commentService = {
    addComment: async (tripId: string, pointId: string, userId: string, content: string) => {
        const commentCollectionRef = collection(db, "trips", tripId, "pointsOfInterest", pointId, "comments");

        const docRef = await addDoc(commentCollectionRef, {
            content,
            userId,
            likesCount: 0,
            timestamp: serverTimestamp(),
            timeStamp: serverTimestamp()
        });

        return docRef.id;
    },

    addReply: async (tripId: string, pointId: string, userId: string, commentId: string, content: string) => {
        const replyCollectionRef = collection(
            db,
            "trips",
            tripId,
            "pointsOfInterest",
            pointId,
            "comments",
            commentId,
            "replies"
        );

        const docRef = await addDoc(replyCollectionRef, {
            content,
            userId,
            likesCount: 0,
            timestamp: serverTimestamp(),
            timeStamp: serverTimestamp()
        });

        return docRef.id;
    },

    getCommentsByPoiId: async (tripId: string, pointId: string) => {
        const commentsRef = collection(db, "trips", tripId, "pointsOfInterest", pointId, "comments");
        const commentsSnap = await getDocs(
            query(commentsRef, orderBy("timestamp", "desc"))
        );
        const q = query(commentsRef, orderBy("timestamp", "desc"));
        const snap = await getDocs(q);

        const currentUserId = useAuthStore.getState().user?.uid ?? null;

        const comments = await Promise.all(
            commentsSnap.docs.map(async (commentDoc) => {
                const commentData = commentDoc.data();

                const userSnap = await getDoc(doc(db, "users", commentData.userId));
                const userData = userSnap.exists() ? userSnap.data() : {};

                const repliesRef = collection(commentDoc.ref, "replies");
                const repliesSnap = await getDocs(
                    query(repliesRef, orderBy("timestamp", "asc"))
                );

                const replies = await Promise.all(
                    repliesSnap.docs.map(async (replyDoc) => {
                        const replyData = replyDoc.data();

                        const replyUserSnap = await getDoc(
                            doc(db, "users", replyData.userId)
                        );
                        const replyUserData = replyUserSnap.exists() ? replyUserSnap.data() : {};

                        return {
                            id: replyDoc.id,
                            userId: replyData.userId,
                            userName: replyUserData.username ?? "",
                            photoUrl: replyUserData.photoUrl ?? "",
                            content: replyData.content ?? "",
                            likesCount: replyData.likesCount ?? 0,
                            likedByCurrentUser: currentUserId ? (await getDoc(doc(replyDoc.ref, "likes", currentUserId))).exists() : false,
                            timestamp: replyData.timestamp?.toDate() ?? new Date(),
                        };
                    })
                );

                return {
                    id: commentDoc.id,
                    userId: commentData.userId,
                    userName: userData.username ?? "",
                    photoUrl: userData.photoUrl ?? "",
                    content: commentData.content ?? "",
                    likesCount: commentData.likesCount ?? 0,
                    likedByCurrentUser: currentUserId ? (await getDoc(doc(commentDoc.ref, "likes", currentUserId))).exists() : false,
                    timestamp: commentData.timestamp?.toDate() ?? new Date(),
                    replies: replies || [],
                };
            })
        );

        return comments;
    },
    addLike: async (tripId: string, pointId: string, commentId: string, userId: string) => {
        const likeRef = doc(db, "trips", tripId, "pointsOfInterest", pointId, "comments", commentId, "likes", userId);
        await setDoc(likeRef, { userId, timestamp: serverTimestamp() });

        const commentRef = doc(db, "trips", tripId, "pointsOfInterest", pointId, "comments", commentId);
        await updateDoc(commentRef, { likesCount: increment(1) });
    },

    removeLike: async (tripId: string, pointId: string, commentId: string, userId: string) => {
        const likeRef = doc(db, "trips", tripId, "pointsOfInterest", pointId, "comments", commentId, "likes", userId);
        await deleteDoc(likeRef);

        const commentRef = doc(db, "trips", tripId, "pointsOfInterest", pointId, "comments", commentId);
        await updateDoc(commentRef, { likesCount: increment(-1) });
    },
    deleteComment: async (tripId: string, pointId: string, commentId: string) => {
        const commentRef = doc(db, "trips", tripId, "pointsOfInterest", pointId, "comments", commentId);
        const repliesRef = collection(commentRef, "replies");
        const repliesSnap = await getDocs(repliesRef);

        const batch = writeBatch(db);
        const commentLikesSnap = await getDocs(collection(commentRef, "likes"));
        commentLikesSnap.docs.forEach((doc) => batch.delete(doc.ref));
        for (const replyDoc of repliesSnap.docs) {
            const replyLikesSnap = await getDocs(collection(replyDoc.ref, "likes"));
            replyLikesSnap.docs.forEach((likeDoc) => batch.delete(likeDoc.ref));
            batch.delete(replyDoc.ref);
        }
        batch.delete(commentRef);
        await batch.commit();
    },
    deleteReply: async (tripId: string, pointId: string, commentId: string, replyId: string) => {
        const replyRef = doc(db, "trips", tripId, "pointsOfInterest", pointId, "comments", commentId, "replies", replyId);

        const batch = writeBatch(db);
        const replyLikesSnap = await getDocs(collection(replyRef, "likes"));
        replyLikesSnap.docs.forEach((doc) => batch.delete(doc.ref));

        batch.delete(replyRef);
        await batch.commit();
    }
}