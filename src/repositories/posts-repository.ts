import { postsCollection } from '../db/db';
import { PostModel } from '../models/PostModel';
import { DBPostModel } from '../models/DBPostModel';
import { FiltersModel } from '../models/FiltersModel';

export const postsLocalRepository = {
    async getPostsCount(): Promise<number> {
        return await postsCollection.count();
    },

    async findPosts(filters: FiltersModel): Promise<DBPostModel[]> {
        const filter: { blogId?: string } = {};
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        if (filters.blogId) {
            filter.blogId = filters.blogId;
        }

        return postsCollection.find(filter).sort(sort).skip(skip).limit(filters.pageSize).toArray();
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
