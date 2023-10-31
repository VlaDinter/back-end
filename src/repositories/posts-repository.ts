import { postsCollection } from '../db/db';
import { PostModel } from '../models/PostModel';
import { blogsLocalRepository } from './blogs-repository';

export const postsLocalRepository = {
    async findPosts(): Promise<PostModel[]> {
        return postsCollection.find({}).toArray();
    },

    async findPost(id: string): Promise<PostModel | null> {
        const post = await postsCollection.findOne({ id });

        if (!post) {
            return null;
        }

        return post;
    },

    async createPost({ title, shortDescription, content, blogId }: PostModel): Promise<PostModel> {
        const blog = await blogsLocalRepository.findBlog(blogId);
        const newPost = {
            id: `${+(new Date())}`,
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString(),
        };

        const result = await postsCollection.insertOne(newPost);

        return newPost;
    },

    async updatePost(id: string, newPost: PostModel): Promise<PostModel | null> {
        const result = await postsCollection.updateOne({ id }, { $set: newPost });
        const post = await this.findPost(id);

        if (result.matchedCount === 1) {
            return post;
        }

        return null;
    },

    async removePost(id: string): Promise<PostModel | null> {
        const post = await this.findPost(id);
        const result = await postsCollection.deleteOne({ id });

        if (result.deletedCount === 1) {
            return post;
        }

        return null;
    },

    async deleteAll(): Promise<void> {
        await postsCollection.deleteMany({});
    }
};
