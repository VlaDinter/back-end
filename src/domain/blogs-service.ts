import { ParsedQs } from 'qs';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { BlogOutputModel } from '../models/BlogOutputModel';
import { DBBlogModel } from '../models/DBBlogModel';
import { SortDirectionModel } from '../models/SortDirectionModel';
import { PaginationModel } from '../models/PaginationModel';
import { PostOutputModel } from '../models/PostOutputModel';
import { postsService } from './posts-service';
import { DBPostModel } from '../models/DBPostModel';

export const blogsService = {
    _mapDBBlogToBlogOutputModel(dbBlog: DBBlogModel): DBBlogModel {
        return {
            id: dbBlog.id,
            name: dbBlog.name,
            description: dbBlog.description,
            websiteUrl: dbBlog.websiteUrl,
            createdAt: dbBlog.createdAt,
            isMembership: dbBlog.isMembership
        };
    },

    async getBlogs(queryParams: ParsedQs): Promise<PaginationModel<DBBlogModel>> {
        const filters = {
            searchNameTerm: typeof queryParams.searchNameTerm === 'string' ? queryParams.searchNameTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionModel.ASC ? SortDirectionModel.ASC : SortDirectionModel.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await blogsLocalRepository.findBlogs(filters);
        const blogsCount = await blogsLocalRepository.getBlogsCount(filters);

        return {
            pagesCount: Math.ceil(blogsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: blogsCount,
            items: result.map(this._mapDBBlogToBlogOutputModel)
        };
    },

    async getBlog(id: string): Promise<DBBlogModel | null> {
        const result = await blogsLocalRepository.findBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async setBlog(newBlog: BlogOutputModel): Promise<DBBlogModel> {
        const blog = {
            id: `${+(new Date())}`,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        };

        const result = await blogsLocalRepository.createBlog(blog);

        return this._mapDBBlogToBlogOutputModel(result);
    },

    async editBlog(id: string, newBlog: BlogOutputModel): Promise<DBBlogModel | null> {
        const result = await blogsLocalRepository.updateBlog(id, {
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        });

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async deleteBlog(id: string): Promise<DBBlogModel | null> {
        const result = await blogsLocalRepository.removeBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async getPosts(blogId: string, queryParams: ParsedQs): Promise<PaginationModel<DBPostModel> | null> {
        return await this.getBlog(blogId) && await postsService.getPosts(queryParams, blogId);
    },

    async setPost(blogId: string, newPost: PostOutputModel): Promise<DBPostModel | null> {
        return await this.getBlog(blogId) && await postsService.setPost({ ...newPost, blogId });
    },

    async deleteAll(): Promise<void> {
        await blogsLocalRepository.removeAll();
    }
};
