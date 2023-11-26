import { commentsCollection } from '../db/db';
import { FiltersModel } from '../models/FiltersModel';
import { Filter } from 'mongodb';
import { DBCommentModel } from '../models/DBCommentModel';
import { CommentOutputModel } from '../models/CommentOutputModel';

export const commentsLocalRepository = {
    getCommentsFilter(filters: FiltersModel): Filter<DBCommentModel> {
        const filter: Filter<DBCommentModel> = {};

        if (filters.postId) {
            filter.postId = filters.postId;
        }

        return filter;
    },

    async getCommentsCount(filters: FiltersModel): Promise<number> {
        const filter = this.getCommentsFilter(filters);

        return await commentsCollection.find(filter).count();
    },

    async findComments(filters: FiltersModel): Promise<DBCommentModel[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };
        const filter = this.getCommentsFilter(filters);

        return await commentsCollection.find(filter).sort(sort).skip(skip).limit(filters.pageSize).toArray();
    },

    async findComment(id: string): Promise<DBCommentModel | null> {
        return await commentsCollection.findOne({ id });
    },

    async createComment(newComment: DBCommentModel): Promise<DBCommentModel> {
        const result = await commentsCollection.insertOne(newComment);

        return newComment;
    },

    async updateComment(id: string, newComment: CommentOutputModel): Promise<void> {
        await commentsCollection.updateOne(
            { id },
            { $set: newComment }
        );
    },

    async removeComment(id: string): Promise<void> {
        await commentsCollection.deleteOne({ id });
    },

    async removeAll(): Promise<void> {
        await commentsCollection.deleteMany({});
    }
};
