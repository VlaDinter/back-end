import { LikesInfoType } from './LikesInfoType';

export type DBPostType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt?: string,
    extendedLikesInfo: LikesInfoType
};
