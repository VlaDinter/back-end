import { ParsedQs } from 'qs';
import { BlogsRepository } from '../repositories/blogs-repository';
import { BlogType } from '../types/BlogType';
import { DBBlogType } from '../types/DBBlogType';
import { SortDirectionEnum } from '../types/SortDirectionEnum';
import { PaginationType } from '../types/PaginationType';
import { PostType } from '../types/PostType';
import { PostsService } from './posts-service';
import { DBPostType } from '../types/DBPostType';
import { inject, injectable } from 'inversify';

@injectable()
export class BlogsService {
    constructor(
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository,
        @inject(PostsService) protected postsService: PostsService
    ) {}

    _mapDBBlogToBlogOutputModel(dbBlog: DBBlogType): DBBlogType {
        return {
            id: dbBlog.id,
            name: dbBlog.name,
            description: dbBlog.description,
            websiteUrl: dbBlog.websiteUrl,
            createdAt: dbBlog.createdAt,
            isMembership: dbBlog.isMembership
        };
    }

    async getBlogs(queryParams: ParsedQs): Promise<PaginationType<DBBlogType>> {
        const filters = {
            searchNameTerm: typeof queryParams.searchNameTerm === 'string' ? queryParams.searchNameTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionEnum.ASC ? SortDirectionEnum.ASC : SortDirectionEnum.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await this.blogsRepository.findBlogs(filters);
        const blogsCount = await this.blogsRepository.findBlogsCount(filters);

        return {
            pagesCount: Math.ceil(blogsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: blogsCount,
            items: result.map(this._mapDBBlogToBlogOutputModel)
        };
    }

    async getBlog(id: string): Promise<DBBlogType | null> {
        const result = await this.blogsRepository.findBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    }

    async addBlog(newBlog: BlogType): Promise<DBBlogType> {
        const blog = {
            id: `${+(new Date())}`,
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        };

        const result = await this.blogsRepository.createBlog(blog);

        return this._mapDBBlogToBlogOutputModel(result);
    }

    async editBlog(id: string, newBlog: BlogType): Promise<DBBlogType | null> {
        const result = await this.blogsRepository.updateBlog(id, {
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl
        });

        return result && this._mapDBBlogToBlogOutputModel(result);
    }

    async removeBlog(id: string): Promise<DBBlogType | null> {
        const result = await this.blogsRepository.deleteBlog(id);

        return result && this._mapDBBlogToBlogOutputModel(result);
    }

    async getPosts(blogId: string, queryParams: ParsedQs, userId = ''): Promise<PaginationType<DBPostType> | null> {
        return await this.getBlog(blogId) && await this.postsService.getPosts(queryParams, userId, blogId);
    }

    async addPost(blogId: string, newPost: PostType, userId = ''): Promise<DBPostType | null> {
        return await this.getBlog(blogId) && await this.postsService.addPost({ ...newPost, blogId }, userId);
    }

    async removeAll(): Promise<void> {
        await this.blogsRepository.deleteAll();
    }
}
