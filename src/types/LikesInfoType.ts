import { LikeDetailsType } from './LikeDetailsType';
import { LikeStatusType } from './LikeStatusType';

export type LikesInfoType = {
    likes?: LikeDetailsType[],
    dislikes?: LikeDetailsType[],
    likesCount?: number,
    dislikesCount?: number,
    myStatus?: LikeStatusType,
    newestLikes?: LikeDetailsType[]
};
