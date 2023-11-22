import { postsCollection } from '../db/db';
import { DBPostModel } from '../models/DBPostModel';
import { FiltersModel } from '../models/FiltersModel';
import { Filter } from 'mongodb';
import { PostOutputModel } from '../models/PostOutputModel';

export const postsLocalRepository = {
    getPostsFilter(filters: FiltersModel): Filter<DBPostModel> {
        const filter: Filter<DBPostModel> = {};

        if (filters.blogId) {
            filter.blogId = filters.blogId;
        }

        return filter;
    },

    async getPostsCount(filters: FiltersModel): Promise<number> {
        const filter = this.getPostsFilter(filters);

        return await postsCollection.find(filter).count();
    },

    async findPosts(filters: FiltersModel): Promise<DBPostModel[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };
        const filter = this.getPostsFilter(filters);

        return await postsCollection.find(filter).sort(sort).skip(skip).limit(filters.pageSize).toArray();
    },

    async findPost(id: string): Promise<DBPostModel | null> {
        return await postsCollection.findOne({ id });
    },

    async createPost(newPost: DBPostModel): Promise<DBPostModel> {
        const result = await postsCollection.insertOne(newPost);

        return newPost;
    },

    async updatePost(id: string, newPost: PostOutputModel): Promise<DBPostModel | null> {
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
