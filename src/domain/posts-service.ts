import { ParsedQs } from 'qs';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { DBPostModel } from '../models/DBPostModel';
import { PostOutputModel } from '../models/PostOutputModel';
import { postsLocalRepository } from '../repositories/posts-repository';
import { SortDirectionModel } from '../models/SortDirectionModel';
import { PaginationModel } from '../models/PaginationModel';

export const postsService = {
    _mapDBPostToPostOutputModel(dbPost: DBPostModel): DBPostModel {
        return {
            id: dbPost.id,
            title: dbPost.title,
            shortDescription: dbPost.shortDescription,
            content: dbPost.content,
            blogId: dbPost.blogId,
            blogName: dbPost.blogName,
            createdAt: dbPost.createdAt
        };
    },

    async getPosts(queryParams: ParsedQs): Promise<PaginationModel<DBPostModel>> {
        const filters = {
            blogId: typeof queryParams.blogId === 'string' ? queryParams.blogId : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionModel.ASC ? SortDirectionModel.ASC : SortDirectionModel.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await postsLocalRepository.findPosts(filters);
        const postsCount = await postsLocalRepository.getPostsCount(filters);

        return {
            pagesCount: Math.ceil(postsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: postsCount,
            items: result.map(this._mapDBPostToPostOutputModel)
        };
    },

    async getPost(id: string): Promise<DBPostModel | null> {
        const result = await postsLocalRepository.findPost(id);

        return result && this._mapDBPostToPostOutputModel(result);
    },

    async setPost(newPost: PostOutputModel): Promise<DBPostModel> {
        const blog = await blogsLocalRepository.findBlog(newPost.blogId);
        const post = {
            id: `${+(new Date())}`,
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            createdAt: new Date().toISOString()
        };

        const result = await postsLocalRepository.createPost(post);

        return this._mapDBPostToPostOutputModel(result);
    },

    async editPost(id: string, newPost: PostOutputModel): Promise<DBPostModel | null> {
        const blog = await blogsLocalRepository.findBlog(newPost.blogId);
        const result = await postsLocalRepository.updatePost(id, {
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name
        });

        return result && this._mapDBPostToPostOutputModel(result);
    },

    async deletePost(id: string): Promise<DBPostModel | null> {
        const result = await postsLocalRepository.removePost(id);

        return result && this._mapDBPostToPostOutputModel(result);
    },

    async deleteAll(): Promise<void> {
        await postsLocalRepository.removeAll();
    }
};
