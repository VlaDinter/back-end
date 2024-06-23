import { ParsedQs } from 'qs';
import { SortDirectionEnum } from '../types/SortDirectionEnum';
import { PaginationType } from '../types/PaginationType';
import { CommentsRepository } from '../repositories/comments-repository';
import { DBCommentType } from '../types/DBCommentType';
import { CommentType } from '../types/CommentType';
import { UsersService } from './users-service';
import { LikeStatusType } from '../types/LikeStatusType';
import { LikeStatusEnum } from '../types/LikeStatusEnum';
import { inject, injectable } from 'inversify';

@injectable()
export class CommentsService {
    constructor(
        @inject(CommentsRepository) protected commentsRepository: CommentsRepository,
        @inject(UsersService) protected usersService: UsersService
    ) {}

    _mapDBCommentToCommentOutputModel(dbBlog: DBCommentType, userId = ''): DBCommentType {
        return {
            id: dbBlog.id,
            content: dbBlog.content,
            createdAt: dbBlog.createdAt,
            commentatorInfo: {
                userId: dbBlog.commentatorInfo.userId,
                userLogin: dbBlog.commentatorInfo.userLogin
            },

            likesInfo: {
                likesCount: dbBlog.likesInfo.likes!.length,
                dislikesCount: dbBlog.likesInfo.dislikes!.length,
                myStatus: (dbBlog.likesInfo.likes!.some(like => like.userId ===  userId) && LikeStatusEnum.Like)
                    || (dbBlog.likesInfo.dislikes!.some(dislike => dislike.userId ===  userId) && LikeStatusEnum.Dislike)
                    || LikeStatusEnum.None
            }
        };
    }

    async getComments(postId: string, queryParams: ParsedQs, userId = ''): Promise<PaginationType<DBCommentType>> {
        const filters = {
            postId,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionEnum.ASC ? SortDirectionEnum.ASC : SortDirectionEnum.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await this.commentsRepository.findComments(filters);
        const commentsCount = await this.commentsRepository.findUsersCount(filters);

        return {
            pagesCount: Math.ceil(commentsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: commentsCount,
            items: result.map((comment: DBCommentType) => this._mapDBCommentToCommentOutputModel(comment, userId))
        };
    }

    async getComment(id: string, userId = ''): Promise<DBCommentType | null> {
        const result = await this.commentsRepository.findComment(id);

        return result && this._mapDBCommentToCommentOutputModel(result, userId);
    }

    async addComment(postId: string, newComment: CommentType, userId: string): Promise<DBCommentType> {
        const user = await this.usersService.getUserById(userId);
        const comment = {
            id: `${+(new Date())}`,
            postId,
            content: newComment.content,
            commentatorInfo: {
                userId,
                userLogin: user!.login
            },

            likesInfo: {
                dislikes: [],
                likes: []
            }
        };

        const result = await this.commentsRepository.createComment(comment);

        return this._mapDBCommentToCommentOutputModel(result, userId);
    }

    async editComment(id: string, newComment: CommentType): Promise<void> {
        await this.commentsRepository.updateComment(id, {
            content: newComment.content
        });
    }

    async editCommentLikesInfo(id: string, likeStatus: LikeStatusType, userId: string): Promise<void> {
        const result = await this.commentsRepository.findComment(id);
        const user = await this.usersService.getUserById(userId);

        if (result && user) {
            let likes = result.likesInfo.likes!.filter(like => like.userId !== userId);
            let dislikes = result.likesInfo.dislikes!.filter(dislike => dislike.userId !== userId);

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

            await this.commentsRepository.updateCommentLikesInfo(id, likes, dislikes);
        }
    }

    async removeComment(id: string): Promise<void> {
        await this.commentsRepository.deleteComment(id);
    }

    async removeAll(): Promise<void> {
        await this.commentsRepository.deleteAll();
    }
}
