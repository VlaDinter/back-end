import { CommentatorInfoType } from './CommentatorInfoType';
import { LikesInfoType } from './LikesInfoType';

export type DBCommentType = {
    id: string,
    postId?: string,
    content: string,
    commentatorInfo: CommentatorInfoType,
    createdAt?: string,
    likesInfo: LikesInfoType
};
