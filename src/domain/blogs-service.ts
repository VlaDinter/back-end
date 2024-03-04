import { ParsedQs } from 'qs';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { BlogOutputType } from '../types/BlogOutputType';
import { DBBlogType } from '../types/DBBlogType';
import { SortDirectionType } from '../types/SortDirectionType';
import { PaginationType } from '../types/PaginationType';
import { PostOutputType } from '../types/PostOutputType';
import { postsService } from './posts-service';
import { DBPostType } from '../types/DBPostType';

export const blogsService = {
    _mapDBBlogToBlogOutputModel(dbBlog: DBBlogType): DBBlogType {
        return {
            id: dbBlog.id,
            name: dbBlog.name,
            description: dbBlog.description,
            websiteUrl: dbBlog.websiteUrl,
            createdAt: dbBlog.createdAt,
            isMembership: dbBlog.isMembership
        };
    },

    async getBlogs(queryParams: ParsedQs): Promise<PaginationType<DBBlogType>> {
        const filters = {
            searchNameTerm: typeof queryParams.searchNameTerm === 'string' ? queryParams.searchNameTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionType.ASC ? SortDirectionType.ASC : SortDirectionType.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await blogsLocalRepository.findBlogs(filters);
        const blogsCount = await blogsLocalRepository.findBlogsCount(filters);

        return {
            pagesCount: Math.ceil(blogsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: blogsCount,
            items: result.map(this._mapDBBlogToBlogOutputModel)
        };
    },

    async getBlog(id: string): Promise<DBBlogType | null> {
        const result = await blogsLocalRepository.findBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async setBlog(newBlog: BlogOutputType): Promise<DBBlogType> {
        const blog = {
            id: `${+(new Date())}`,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        };

        const result = await blogsLocalRepository.createBlog(blog);

        return this._mapDBBlogToBlogOutputModel(result);
    },

    async editBlog(id: string, newBlog: BlogOutputType): Promise<DBBlogType | null> {
        const result = await blogsLocalRepository.updateBlog(id, {
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        });

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async deleteBlog(id: string): Promise<DBBlogType | null> {
        const result = await blogsLocalRepository.removeBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    },

    async getPosts(blogId: string, queryParams: ParsedQs): Promise<PaginationType<DBPostType> | null> {
        return await this.getBlog(blogId) && await postsService.getPosts(queryParams, blogId);
    },

    async setPost(blogId: string, newPost: PostOutputType): Promise<DBPostType | null> {
        return await this.getBlog(blogId) && await postsService.setPost({ ...newPost, blogId });
    },

    async deleteAll(): Promise<void> {
        await blogsLocalRepository.removeAll();
    }
};
