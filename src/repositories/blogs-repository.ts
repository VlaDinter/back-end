import { blogsCollection } from '../db/db';
import { BlogModel } from '../models/BlogModel';

export const blogsLocalRepository = {
    async findBlogs(): Promise<BlogModel[]> {
        const blogs = await blogsCollection.find({}).toArray();

        return blogs.map(blog => ({
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }));
    },

    async findBlog(id: string): Promise<BlogModel | null> {
        const blog = await blogsCollection.findOne({ id });

        if (!blog) {
            return null;
        }

        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
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

        return {
            id: newBlog.id,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership
        };
    },

    async updateBlog(id: string, { name, description, websiteUrl }: BlogModel): Promise<BlogModel | null> {
        const result = await blogsCollection.updateOne(
            { id },
            { $set: { name, description, websiteUrl } }
        );

        const blog = await this.findBlog(id);

        if (result.matchedCount === 1) {
            return {
                id: blog!.id,
                name: blog!.name,
                description: blog!.description,
                websiteUrl: blog!.websiteUrl,
                createdAt: blog!.createdAt,
                isMembership: blog!.isMembership
            };
        }

        return null;
    },

    async removeBlog(id: string): Promise<BlogModel | null> {
        const blog = await this.findBlog(id);
        const result = await blogsCollection.deleteOne({ id });

       if (result.deletedCount === 1) {
           return {
               id: blog!.id,
               name: blog!.name,
               description: blog!.description,
               websiteUrl: blog!.websiteUrl,
               createdAt: blog!.createdAt,
               isMembership: blog!.isMembership
           };
       }

        return null;
    },

    async deleteAll(): Promise<void> {
        await blogsCollection.deleteMany({});
    }
};
