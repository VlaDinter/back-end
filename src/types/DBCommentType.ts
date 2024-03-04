import { CommentatorInfoType } from './CommentatorInfoType';

export type DBCommentType = {
    id: string,
    postId?: string,
    content: string,
    commentatorInfo: CommentatorInfoType,
    createdAt?: string
};
