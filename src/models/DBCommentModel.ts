import { CommentatorInfoModel } from './CommentatorInfoModel';

export type DBCommentModel = {
    id: string,
    postId?: string,
    content: string,
    commentatorInfo: CommentatorInfoModel,
    createdAt: string
};
