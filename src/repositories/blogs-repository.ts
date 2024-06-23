import { Query } from 'mongoose';
import { DBBlogType } from '../types/DBBlogType';
import { FiltersType } from '../types/FiltersType';
import { BlogModel } from '../models/blog-model';
import { BlogType } from '../types/BlogType';
import { injectable } from 'inversify';

@injectable()
export class BlogsRepository {
    findBlogsQuery(filters: FiltersType): Query<DBBlogType[], DBBlogType> {
        const query = BlogModel.find({}, { _id: 0 });

        if (filters.searchNameTerm) {
            query.where('name').regex(new RegExp(filters.searchNameTerm, 'i'));
        }

        return query;
    }

    async findBlogsCount(filters: FiltersType): Promise<number> {
        return this.findBlogsQuery(filters).countDocuments().lean();
    }

    async findBlogs(filters: FiltersType): Promise<DBBlogType[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        return this.findBlogsQuery(filters).sort(sort).skip(skip).limit(filters.pageSize).lean();
    }

    async findBlog(id: string): Promise<DBBlogType | null> {
        return BlogModel.findOne({ id }, { _id: 0 }).lean();
    }

    async createBlog(newBlog: DBBlogType): Promise<DBBlogType> {
        const blogInstance = new BlogModel();

        blogInstance.id = newBlog.id;
        blogInstance.name = newBlog.name;
        blogInstance.description = newBlog.description;
        blogInstance.websiteUrl = newBlog.websiteUrl;

        await blogInstance.save();

        return blogInstance;
    }

    async updateBlog(id: string, newBlog: BlogType): Promise<DBBlogType | null> {
        const blogInstance = await BlogModel.findOne({ id });

        if (!blogInstance) return null;

        blogInstance.name = newBlog.name;
        blogInstance.description = newBlog.description;
        blogInstance.websiteUrl = newBlog.websiteUrl;

        const result = await blogInstance.save();

        return result;
    }

    async deleteBlog(id: string): Promise<DBBlogType | null> {
        const blogInstance = await BlogModel.findOne({ id });

        if (!blogInstance) return null;

        await blogInstance.deleteOne();

        return blogInstance;
    }

    async deleteAll(): Promise<void> {
        await BlogModel.deleteMany({});
    }
}
