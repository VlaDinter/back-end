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
import { LikeStatusType } from '../types/LikeStatusType';
import { LikeStatusesType } from '../types/LikeStatusesType';
import { usersService } from './users-service';

export const postsService = {
    _mapDBPostToPostOutputModel(dbPost: DBPostType, userId = ''): DBPostType {
        return {
            id: dbPost.id,
            title: dbPost.title,
            shortDescription: dbPost.shortDescription,
            content: dbPost.content,
            blogId: dbPost.blogId,
            blogName: dbPost.blogName,
            createdAt: dbPost.createdAt,
            extendedLikesInfo: {
                likesCount: dbPost.extendedLikesInfo.likes!.length,
                dislikesCount: dbPost.extendedLikesInfo.dislikes!.length,
                newestLikes: dbPost.extendedLikesInfo.likes!.slice(-3).reverse().map(like => ({
                    userId: like.userId,
                    login: like.login,
                    addedAt: like.addedAt
                })),

                myStatus: (dbPost.extendedLikesInfo.likes!.some(like => like.userId ===  userId) && LikeStatusType.Like)
                    || (dbPost.extendedLikesInfo.dislikes!.some(dislike => dislike.userId ===  userId) && LikeStatusType.Dislike)
                    || LikeStatusType.None
            }
        };
    },

    async getPosts(queryParams: ParsedQs, blogId?: string, userId = ''): Promise<PaginationType<DBPostType>> {
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
            items: result.map((post: DBPostType) => this._mapDBPostToPostOutputModel(post, userId))
        };
    },

    async getPost(id: string, userId = ''): Promise<DBPostType | null> {
        const result = await postsLocalRepository.findPost(id);

        return result && this._mapDBPostToPostOutputModel(result, userId);
    },

    async setPost(newPost: PostOutputType, userId = ''): Promise<DBPostType> {
        const blog = await blogsLocalRepository.findBlog(newPost.blogId);
        const post = {
            id: `${+(new Date())}`,
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name,
            extendedLikesInfo: {
                dislikes: [],
                likes: []
            }
        };

        const result = await postsLocalRepository.createPost(post);

        return this._mapDBPostToPostOutputModel(result, userId);
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

    async editPostExtendedLikesInfo(id: string, likeStatus: LikeStatusesType, userId: string): Promise<void> {
        const result = await postsLocalRepository.findPost(id);
        const user = await usersService.getUserById(userId);

        if (result && user) {
            let likes = result.extendedLikesInfo.likes!.filter(like => like.userId !== userId);
            let dislikes = result.extendedLikesInfo.dislikes!.filter(dislike => dislike.userId !== userId);

            if (likeStatus === LikeStatusType.Like) {
                likes.push({
                    userId,
                    login: user.login,
                    addedAt: new Date().toISOString()
                });
            }

            if (likeStatus === LikeStatusType.Dislike) {
                dislikes.push({
                    userId,
                    login: user.login,
                    addedAt: new Date().toISOString()
                });
            }

            await postsLocalRepository.updatePostExtendedLikesInfo(id, likes, dislikes);
        }
    },

    async deletePost(id: string): Promise<DBPostType | null> {
        const result = await postsLocalRepository.removePost(id);

        return result && this._mapDBPostToPostOutputModel(result);
    },

    async getComments(postId: string, queryParams: ParsedQs, userId = ''): Promise<PaginationType<DBCommentType> | null> {
        return await this.getPost(postId) && await commentsService.getComments(postId, queryParams, userId);
    },

    async setComment(postId: string, newComment: CommentOutputType, userId: string): Promise<DBCommentType | null> {
        return await this.getPost(postId) && await commentsService.setComment(postId, newComment, userId);
    },

    async deleteAll(): Promise<void> {
        await postsLocalRepository.removeAll();
    }
};
