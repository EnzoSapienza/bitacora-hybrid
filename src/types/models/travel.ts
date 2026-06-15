type Travel = {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    imageUrl: string | null;
    startDate: Date;
    endDate: Date;
    pointsCount: number;
    durationDays: number;
    visibility: 'PRIVATE' | 'PUBLIC' | 'FOLLOWERS';
    privileges: string[] | null;
    updatedAt: Date | null;
};

export default Travel;