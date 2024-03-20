import { LikeStatusesType } from './LikeStatusesType';
import { LikeDetailsType } from './LikeDetailsType';

export type LikesInfoType = {
    likes?: LikeDetailsType[],
    dislikes?: LikeDetailsType[],
    likesCount?: number,
    dislikesCount?: number,
    myStatus?: LikeStatusesType,
    newestLikes?: LikeDetailsType[]
};
