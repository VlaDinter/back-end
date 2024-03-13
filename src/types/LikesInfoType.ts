import { LikeStatusesType } from './LikeStatusesType';

export type LikesInfoType = {
    likes?: string[],
    dislikes?: string[],
    likesCount?: number,
    dislikesCount?: number,
    myStatus?: LikeStatusesType
};
