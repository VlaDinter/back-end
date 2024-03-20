import { Query } from 'mongoose';
import { DBPostType } from '../types/DBPostType';
import { FiltersType } from '../types/FiltersType';
import { PostOutputType } from '../types/PostOutputType';
import { PostModel } from '../models/post-model';
import { LikeDetailsType } from '../types/LikeDetailsType';

export const postsLocalRepository = {
    findPostsQuery(filters: FiltersType): Query<DBPostType[], DBPostType> {
        const query = PostModel.find({}, { _id: 0 });

        if (filters.blogId) {
            query.where({ blogId: filters.blogId });
        }

        return query;
    },

    async getPostsCount(filters: FiltersType): Promise<number> {
        return this.findPostsQuery(filters).countDocuments().lean();
    },

    async findPosts(filters: FiltersType): Promise<DBPostType[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        return this.findPostsQuery(filters).sort(sort).skip(skip).limit(filters.pageSize).lean();
    },

    async findPost(id: string): Promise<DBPostType | null> {
        return PostModel.findOne({ id }, { _id: 0 });
    },

    async createPost(newPost: DBPostType): Promise<DBPostType> {
        const postInstance = new PostModel();

        postInstance.id = newPost.id;
        postInstance.title = newPost.title;
        postInstance.shortDescription = newPost.shortDescription;
        postInstance.content = newPost.content;
        postInstance.blogId = newPost.blogId;
        postInstance.blogName = newPost.blogName;
        postInstance.extendedLikesInfo = newPost.extendedLikesInfo;

        await postInstance.save();

        return postInstance;
    },

    async updatePost(id: string, newPost: PostOutputType): Promise<DBPostType | null> {
        const postInstance = await PostModel.findOne({ id });

        if (!postInstance) return null;

        postInstance.title = newPost.title;
        postInstance.shortDescription = newPost.shortDescription;
        postInstance.content = newPost.content;
        postInstance.blogId = newPost.blogId;
        postInstance.blogName = newPost.blogName;

        const result = await postInstance.save();

        return result;
    },

    async updatePostExtendedLikesInfo(id: string, likes: LikeDetailsType[], dislikes: LikeDetailsType[]): Promise<void> {
        const postInstance = await PostModel.findOne({ id });

        if (postInstance) {
            postInstance.extendedLikesInfo.likes = likes;
            postInstance.extendedLikesInfo.dislikes = dislikes;

            await postInstance.save();
        }
    },

    async removePost(id: string): Promise<DBPostType | null> {
        const postInstance = await PostModel.findOne({ id });

        if (!postInstance) return null;

        await postInstance.deleteOne();

        return postInstance;
    },

    async removeAll(): Promise<void> {
        await PostModel.deleteMany({});
    }
};
