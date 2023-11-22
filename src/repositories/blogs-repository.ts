import { blogsCollection } from '../db/db';
import { DBBlogModel } from '../models/DBBlogModel';
import { FiltersModel } from '../models/FiltersModel';
import { Filter } from 'mongodb';
import { BlogOutputModel } from '../models/BlogOutputModel';

export const blogsLocalRepository = {
    getBlogsFilter(filters: FiltersModel): Filter<DBBlogModel> {
        const filter: Filter<DBBlogModel> = {};

        if (filters.searchNameTerm) {
            filter.name = { $regex: filters.searchNameTerm };
        }

        return filter;
    },

    async getBlogsCount(filters: FiltersModel): Promise<number> {
        const filter = this.getBlogsFilter(filters);

        return await blogsCollection.find(filter).count();
    },

    async findBlogs(filters: FiltersModel): Promise<DBBlogModel[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };
        const filter = this.getBlogsFilter(filters);

        return await blogsCollection.find(filter).sort(sort).skip(skip).limit(filters.pageSize).toArray();
    },

    async findBlog(id: string): Promise<DBBlogModel | null> {
        return await blogsCollection.findOne({ id });
    },

    async createBlog(newBlog: DBBlogModel): Promise<DBBlogModel> {
        const result = await blogsCollection.insertOne(newBlog);

        return newBlog;
    },

    async updateBlog(id: string, newBlog: BlogOutputModel): Promise<DBBlogModel | null> {
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
