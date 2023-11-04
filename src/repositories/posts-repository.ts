import { postsCollection } from '../db/db';
import { PostModel } from '../models/PostModel';
import { DBPostModel } from '../models/DBPostModel';
import { FiltersModel } from '../models/FiltersModel';
import { FindCursor } from 'mongodb';

export const postsLocalRepository = {
    getPostsFilter(filters: FiltersModel): FindCursor {
        const filter: { blogId?: string } = {};

        if (filters.blogId) {
            filter.blogId = filters.blogId;
        }

        return postsCollection.find(filter);
    },

    async getPostsCount(filters: FiltersModel): Promise<number> {
        return await this.getPostsFilter(filters).count();
    },

    async findPosts(filters: FiltersModel): Promise<DBPostModel[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        return this.getPostsFilter(filters).sort(sort).skip(skip).limit(filters.pageSize).toArray();
    },

    async findPost(id: string): Promise<DBPostModel | null> {
        return await postsCollection.findOne({ id });
    },

    async createPost(newPost: DBPostModel): Promise<DBPostModel> {
        const result = await postsCollection.insertOne(newPost);

        return newPost;
    },

    async updatePost(id: string, newPost: PostModel): Promise<DBPostModel | null> {
        return await postsCollection.findOneAndUpdate(
            { id },
            { $set: newPost },
        { returnDocument: 'after' }
        );
    },

    async removePost(id: string): Promise<DBPostModel | null> {
        return await postsCollection.findOneAndDelete({ id });
    },

    async removeAll(): Promise<void> {
        await postsCollection.deleteMany({});
    }
};
