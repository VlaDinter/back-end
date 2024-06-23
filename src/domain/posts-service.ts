import { ParsedQs } from 'qs';
import { BlogsRepository } from '../repositories/blogs-repository';
import { DBPostType } from '../types/DBPostType';
import { PostType } from '../types/PostType';
import { PostsRepository } from '../repositories/posts-repository';
import { SortDirectionEnum } from '../types/SortDirectionEnum';
import { PaginationType } from '../types/PaginationType';
import { DBCommentType } from '../types/DBCommentType';
import { CommentsService } from './comments-service';
import { CommentType } from '../types/CommentType';
import { LikeStatusType } from '../types/LikeStatusType';
import { LikeStatusEnum } from '../types/LikeStatusEnum';
import { UsersService } from './users-service';
import { inject, injectable } from 'inversify';

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository,
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository,
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(UsersService) protected usersService: UsersService
    ) {}

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

                myStatus: (dbPost.extendedLikesInfo.likes!.some(like => like.userId ===  userId) && LikeStatusEnum.Like)
                    || (dbPost.extendedLikesInfo.dislikes!.some(dislike => dislike.userId ===  userId) && LikeStatusEnum.Dislike)
                    || LikeStatusEnum.None
            }
        };
    }

    async getPosts(queryParams: ParsedQs, userId = '', blogId?: string): Promise<PaginationType<DBPostType>> {
        const filters = {
            blogId: blogId,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionEnum.ASC ? SortDirectionEnum.ASC : SortDirectionEnum.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await this.postsRepository.findPosts(filters);
        const postsCount = await this.postsRepository.getPostsCount(filters);

        return {
            pagesCount: Math.ceil(postsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: postsCount,
            items: result.map((post: DBPostType) => this._mapDBPostToPostOutputModel(post, userId))
        };
    }

    async getPost(id: string, userId = ''): Promise<DBPostType | null> {
        const result = await this.postsRepository.findPost(id);

        return result && this._mapDBPostToPostOutputModel(result, userId);
    }

    async addPost(newPost: PostType, userId = ''): Promise<DBPostType> {
        const blog = await this.blogsRepository.findBlog(newPost.blogId);
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

        const result = await this.postsRepository.createPost(post);

        return this._mapDBPostToPostOutputModel(result, userId);
    }

    async editPost(id: string, newPost: PostType): Promise<DBPostType | null> {
        const blog = await this.blogsRepository.findBlog(newPost.blogId);
        const result = await this.postsRepository.updatePost(id, {
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: blog!.name
        });

        return result && this._mapDBPostToPostOutputModel(result);
    }

    async editPostExtendedLikesInfo(id: string, likeStatus: LikeStatusType, userId: string): Promise<void> {
        const result = await this.postsRepository.findPost(id);
        const user = await this.usersService.getUserById(userId);

        if (result && user) {
            let likes = result.extendedLikesInfo.likes!.filter(like => like.userId !== userId);
            let dislikes = result.extendedLikesInfo.dislikes!.filter(dislike => dislike.userId !== userId);

            if (likeStatus === LikeStatusEnum.Like) {
                likes.push({
                    userId,
                    login: user.login,
                    addedAt: new Date().toISOString()
                });
            }

            if (likeStatus === LikeStatusEnum.Dislike) {
                dislikes.push({
                    userId,
                    login: user.login,
                    addedAt: new Date().toISOString()
                });
            }

            await this.postsRepository.updatePostExtendedLikesInfo(id, likes, dislikes);
        }
    }

    async removePost(id: string): Promise<DBPostType | null> {
        const result = await this.postsRepository.deletePost(id);

        return result && this._mapDBPostToPostOutputModel(result);
    }

    async getComments(postId: string, queryParams: ParsedQs, userId = ''): Promise<PaginationType<DBCommentType> | null> {
        return await this.getPost(postId) && await this.commentsService.getComments(postId, queryParams, userId);
    }

    async addComment(postId: string, newComment: CommentType, userId: string): Promise<DBCommentType | null> {
        return await this.getPost(postId) && await this.commentsService.addComment(postId, newComment, userId);
    }

    async removeAll(): Promise<void> {
        await this.postsRepository.deleteAll();
    }
}
