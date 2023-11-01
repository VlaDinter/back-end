import { postsCollection } from '../db/db';
import { PostModel } from '../models/PostModel';
import { blogsLocalRepository } from './blogs-repository';

export const postsLocalRepository = {
    async findPosts(): Promise<PostModel[]> {
        const posts = await postsCollection.find({}).toArray();

        return posts.map(post => ({
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        }));
    },

    async findPost(id: string): Promise<PostModel | null> {
        const post = await postsCollection.findOne({ id });

        if (!post) {
            return null;
        }

        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        };
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
            createdAt: new Date().toISOString()
        };

        const result = await postsCollection.insertOne(newPost);

        return {
            id: newPost.id,
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: newPost.blogName,
            createdAt: newPost.createdAt
        };
    },

    async updatePost(id: string, { title, shortDescription, content, blogId }: PostModel): Promise<PostModel | null> {
        const blog = await blogsLocalRepository.findBlog(blogId);
        const result = await postsCollection.updateOne(
            { id },
            { $set: { title, shortDescription, content, blogId, blogName: blog!.name } }

        );
        const post = await this.findPost(id);

        if (result.matchedCount === 1) {
            return {
                id: post!.id,
                title: post!.title,
                shortDescription: post!.shortDescription,
                content: post!.content,
                blogId: post!.blogId,
                blogName: post!.blogName,
                createdAt: post!.createdAt
            };
        }

        return null;
    },

    async removePost(id: string): Promise<PostModel | null> {
        const post = await this.findPost(id);
        const result = await postsCollection.deleteOne({ id });

        if (result.deletedCount === 1) {
            return {
                id: post!.id,
                title: post!.title,
                shortDescription: post!.shortDescription,
                content: post!.content,
                blogId: post!.blogId,
                blogName: post!.blogName,
                createdAt: post!.createdAt
            };
        }

        return null;
    },

    async deleteAll(): Promise<void> {
        await postsCollection.deleteMany({});
    }
};
