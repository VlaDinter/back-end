import { db } from '../db/db';
import { BlogModel } from '../models/BlogModel';

export const blogsLocalRepository = {
    findBlogs(): BlogModel[] {
        return db.blogs;
    },

    findBlog(id: string): BlogModel | null {
        const blog = db.blogs.find(blog => blog.id === id);

        if (!blog) {
            return null;
        }

        return blog;
    },

    createBlog({ name, description, websiteUrl }: BlogModel): BlogModel {
        const newBlog = {
            id: `${+(new Date())}`,
            name,
            description,
            websiteUrl
        };

        db.blogs.push(newBlog);

        return newBlog;
    },

    updateBlog(id: string, { name, description, websiteUrl }: BlogModel): BlogModel | null {
        const blog = db.blogs.find(blog => blog.id === id);

        if (!blog) {
            return null;
        }

        blog.name = name;
        blog.description = description;
        blog.websiteUrl = websiteUrl;

        return blog;
    },

    removeBlog(id: string): BlogModel | null {
        const blogIndex = db.blogs.findIndex(blog => blog.id === id);

        if (blogIndex < 0) {
            return null;
        }

        const removedBlogs = db.blogs.splice(blogIndex, 1);

        return removedBlogs[0];
    },

    deleteAll(): void {
        db.blogs = [];
    }
};
