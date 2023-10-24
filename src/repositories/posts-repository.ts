import { db } from '../db/db';
import { PostModel } from '../models/PostModel';
import { blogsLocalRepository } from './blogs-repository';

export const postsLocalRepository = {
    findPosts(): PostModel[] {
        return db.posts;
    },

    findPost(id: string): PostModel | null {
        const post = db.posts.find(post => post.id === id);

        if (!post) {
            return null;
        }

        return post;
    },

    createPost({ title, shortDescription, content, blogId }: PostModel): PostModel {
        const blog = blogsLocalRepository.findBlog(blogId);
        const newPost = {
            id: `${+(new Date())}`,
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId,
            blogName: blog!.name
        };

        db.posts.push(newPost);

        return newPost;
    },

    updatePost(id: string, { title, shortDescription, content, blogId }: PostModel): PostModel | null {
        const post = db.posts.find(post => post.id === id);

        if (!post) {
            return null;
        }

        post.title = title;
        post.shortDescription = shortDescription;
        post.content = content;
        post.blogId = blogId;

        return post;
    },

    removePost(id: string): PostModel | null {
        const postIndex = db.posts.findIndex(post => post.id === id);

        if (postIndex < 0) {
            return null;
        }

        const removedPosts = db.posts.splice(postIndex, 1);

        return removedPosts[0];
    },

    deleteAll(): void {
        db.posts = [];
    }
};
