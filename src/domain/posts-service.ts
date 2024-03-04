import { ParsedQs } from 'qs';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { DBPostType } from '../types/DBPostType';
import { PostOutputType } from '../types/PostOutputType';
import { postsLocalRepository } from '../repositories/posts-repository';
import { SortDirectionType } from '../types/SortDirectionType';
import { PaginationType } from '../types/PaginationType';
import { DBCommentType } from '../types/DBCommentType';
import { commentsService } from './comments-service';
import { CommentOutputType } from '../types/CommentOutputType';

export const postsService = {
    _mapDBPostToPostOutputModel(dbPost: DBPostType): DBPostType {
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

    async getPosts(queryParams: ParsedQs, blogId?: string): Promise<PaginationType<DBPostType>> {
        const filters = {
            blogId: blogId,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionType.ASC ? SortDirectionType.ASC : SortDirectionType.DESC,
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

    async getPost(id: string): Promise<DBPostType | null> {
        const result = await postsLocalRepository.findPost(id);

        return result && this._mapDBPostToPostOutputModel(result);
    },

    async setPost(newPost: PostOutputType): Promise<DBPostType> {
        const blog = await blogsLocalRepository.findBlog(newPost.blogId);
        const post = {
            id: `${+(new Date())}`,
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name
        };

        const result = await postsLocalRepository.createPost(post);

        return this._mapDBPostToPostOutputModel(result);
    },

    async editPost(id: string, newPost: PostOutputType): Promise<DBPostType | null> {
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

    async deletePost(id: string): Promise<DBPostType | null> {
        const result = await postsLocalRepository.removePost(id);

        return result && this._mapDBPostToPostOutputModel(result);
    },

    async getComments(postId: string, queryParams: ParsedQs): Promise<PaginationType<DBCommentType> | null> {
        return await this.getPost(postId) && await commentsService.getComments(postId, queryParams);
    },

    async setComment(userId: string, postId: string, newComment: CommentOutputType): Promise<DBCommentType | null> {
        return await this.getPost(postId) && await commentsService.setComment(userId, postId, newComment);
    },

    async deleteAll(): Promise<void> {
        await postsLocalRepository.removeAll();
    }
};
