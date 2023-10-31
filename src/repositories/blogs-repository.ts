import { blogsCollection } from '../db/db';
import { BlogModel } from '../models/BlogModel';

export const blogsLocalRepository = {
    async findBlogs(): Promise<BlogModel[]> {
        return blogsCollection.find({}).toArray();
    },

    async findBlog(id: string): Promise<BlogModel | null> {
        const blog = await blogsCollection.findOne({ id });

        if (!blog) {
            return null;
        }

        return blog;
    },

    async createBlog({ name, description, websiteUrl }: BlogModel): Promise<BlogModel> {
        const newBlog = {
            id: `${+(new Date())}`,
            name,
            description,
            websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        };

        const result = await blogsCollection.insertOne(newBlog);

        return newBlog;
    },

    async updateBlog(id: string, newBlog: BlogModel): Promise<BlogModel | null> {
        const result = await blogsCollection.updateOne({ id }, { $set: newBlog });
        const blog = await this.findBlog(id);

        if (result.matchedCount === 1) {
            return blog;
        }

        return null;
    },

    async removeBlog(id: string): Promise<BlogModel | null> {
        const blog = await this.findBlog(id);
        const result = await blogsCollection.deleteOne({ id });

       if (result.deletedCount === 1) {
           return blog;
       }

        return null;
    },

    async deleteAll(): Promise<void> {
        await blogsCollection.deleteMany({});
    }
};
