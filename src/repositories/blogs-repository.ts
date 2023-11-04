import { blogsCollection } from '../db/db';
import { DBBlogModel } from '../models/DBBlogModel';
import { BlogModel } from '../models/BlogModel';
import { FiltersModel } from '../models/FiltersModel';

export const blogsLocalRepository = {
    async getBlogsCount(): Promise<number> {
        return await blogsCollection.count();
    },

    async findBlogs(filters: FiltersModel): Promise<DBBlogModel[]> {
        const filter: { name?: { $regex: string } } = {};
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        if (filters.searchNameTerm) {
            filter.name = { $regex: filters.searchNameTerm };
        }

        return blogsCollection.find(filter).sort(sort).skip(skip).limit(filters.pageSize).toArray();
    },

    async findBlog(id: string): Promise<DBBlogModel | null> {
        return await blogsCollection.findOne({ id });
    },

    async createBlog(newBlog: DBBlogModel): Promise<DBBlogModel> {
        const result = await blogsCollection.insertOne(newBlog);

        return newBlog;
    },

    async updateBlog(id: string, newBlog: BlogModel): Promise<DBBlogModel | null> {
        return await blogsCollection.findOneAndUpdate(
            { id },
            { $set: newBlog },
            { returnDocument: 'after' }
        );
    },

    async removeBlog(id: string): Promise<DBBlogModel | null> {
        return await blogsCollection.findOneAndDelete({ id });
    },

    async removeAll(): Promise<void> {
        await blogsCollection.deleteMany({});
    }
};
