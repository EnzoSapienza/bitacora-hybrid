export default interface Comment {
    id: string;
    userId: string;
    userName: string;
    photoUrl: string;
    content: string;
    likesCount: number;
    likedByCurrentUser?: boolean;
    timestamp: Date;
    replies?: Comment[];
}