export default interface UserProfile {
    id: string;
    email: string;
    nombre?: string;
    username?: string;
    photoUrl?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
}