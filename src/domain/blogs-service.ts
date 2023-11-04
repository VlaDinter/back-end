import { ParsedQs } from 'qs';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { BlogOutputModel } from '../models/BlogOutputModel';
import { DBBlogModel } from '../models/DBBlogModel';
import { BlogModel } from '../models/BlogModel';
import { SortDirectionModel } from '../models/SortDirectionModel';
import { PageModel } from '../models/PageModel';
import { PostOutputModel } from '../models/PostOutputModel';
import { postsService } from './posts-service';
import { PostModel } from '../models/PostModel';

export const blogsService = {
    _mapDBBlogToBlogOutputModel(dbBlog: DBBlogModel): BlogOutputModel {
        return {
            id: dbBlog.id,
            name: dbBlog.name,
            description: dbBlog.description,
            websiteUrl: dbBlog.websiteUrl,
            createdAt: dbBlog.createdAt,
            isMembership: dbBlog.isMembership
        };
    },

    async getBlogs(queryParams: ParsedQs): Promise<PageModel<BlogOutputModel>> {
        const filters = {
            searchNameTerm: typeof queryParams.searchNameTerm === 'string' ? queryParams.searchNameTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionModel.ASC ? SortDirectionModel.ASC : SortDirectionModel.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await blogsLocalRepository.findBlogs(filters);
        const blogsCount = await blogsLocalRepository.getBlogsCount();

        return {
            pagesCount: Math.ceil(blogsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: blogsCount,
            items: result.map(this._mapDBBlogToBlogOutputModel)
        };
    },

    async getBlog(id: string): Promise<BlogOutputModel | null> {
        const result = await blogsLocalRepository.findBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async setBlog(newBlog: BlogModel): Promise<BlogOutputModel> {
        const blog = {
            id: `${+(new Date())}`,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        };

        const result = await blogsLocalRepository.createBlog(blog as DBBlogModel);

        return this._mapDBBlogToBlogOutputModel(result);
    },

    async editBlog(id: string, newBlog: BlogModel): Promise<BlogOutputModel | null> {
        const result = await blogsLocalRepository.updateBlog(id, {
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        });

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async deleteBlog(id: string): Promise<BlogOutputModel | null> {
        const result = await blogsLocalRepository.removeBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async getPosts(blogId: string, queryParams: ParsedQs): Promise<PageModel<PostOutputModel> | null> {
        return await this.getBlog(blogId) && await postsService.getPosts({ ...queryParams, blogId });
    },

    async setPost(blogId: string, newPost: PostModel): Promise<PostOutputModel | null> {
        return await this.getBlog(blogId) && await postsService.setPost({ ...newPost, blogId });
    },

    async deleteAll(): Promise<void> {
        await blogsLocalRepository.removeAll();
    }
};
