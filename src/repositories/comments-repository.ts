import { Query } from 'mongoose';
import { FiltersType } from '../types/FiltersType';
import { DBCommentType } from '../types/DBCommentType';
import { CommentOutputType } from '../types/CommentOutputType';
import { CommentModel } from '../models/comment-model';

export const commentsLocalRepository = {
    findCommentsQuery(filters: FiltersType): Query<DBCommentType[], DBCommentType> {
        const query = CommentModel.find({}, { _id: 0 });

        if (filters.postId) {
            query.where({ postId: filters.postId });
        }

        return query;
    },

    async findUsersCount(filters: FiltersType): Promise<number> {
        return this.findCommentsQuery(filters).countDocuments().lean();
    },

    async findComments(filters: FiltersType): Promise<DBCommentType[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        return this.findCommentsQuery(filters).sort(sort).skip(skip).limit(filters.pageSize).lean();
    },

    async findComment(id: string): Promise<DBCommentType | null> {
        return CommentModel.findOne({ id }, { _id: 0 }).lean();
    },

    async createComment(newComment: DBCommentType): Promise<DBCommentType> {
        const commentInstance = new CommentModel();

        commentInstance.id = newComment.id;
        commentInstance.postId = newComment.postId;
        commentInstance.content = newComment.content;
        commentInstance.commentatorInfo = newComment.commentatorInfo;

        await commentInstance.save();

        return commentInstance;
    },

    async updateComment(id: string, newComment: CommentOutputType): Promise<void> {
        const commentInstance = await CommentModel.findOne({ id });

        if (commentInstance) {
            commentInstance.content = newComment.content;

            await commentInstance.save();
        }
    },

    async removeComment(id: string): Promise<void> {
        const commentInstance = await CommentModel.findOne({ id });

        if (commentInstance) {
            await commentInstance.deleteOne();
        }
    },

    async removeAll(): Promise<void> {
        await CommentModel.deleteMany({});
    }
};
