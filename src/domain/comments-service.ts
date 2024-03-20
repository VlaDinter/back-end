import { ParsedQs } from 'qs';
import { SortDirectionType } from '../types/SortDirectionType';
import { PaginationType } from '../types/PaginationType';
import { commentsLocalRepository } from '../repositories/comments-repository';
import { DBCommentType } from '../types/DBCommentType';
import { CommentOutputType } from '../types/CommentOutputType';
import { usersService } from './users-service';
import { LikeStatusesType } from '../types/LikeStatusesType';
import { LikeStatusType } from '../types/LikeStatusType';

export const commentsService = {
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
                myStatus: (dbBlog.likesInfo.likes!.some(like => like.userId ===  userId) && LikeStatusType.Like)
                    || (dbBlog.likesInfo.dislikes!.some(dislike => dislike.userId ===  userId) && LikeStatusType.Dislike)
                    || LikeStatusType.None
            }
        };
    },

    async getComments(postId: string, queryParams: ParsedQs, userId = ''): Promise<PaginationType<DBCommentType>> {
        const filters = {
            postId,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionType.ASC ? SortDirectionType.ASC : SortDirectionType.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await commentsLocalRepository.findComments(filters);
        const commentsCount = await commentsLocalRepository.findUsersCount(filters);

        return {
            pagesCount: Math.ceil(commentsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: commentsCount,
            items: result.map((comment: DBCommentType) => this._mapDBCommentToCommentOutputModel(comment, userId))
        };
    },

    async getComment(id: string, userId = ''): Promise<DBCommentType | null> {
        const result = await commentsLocalRepository.findComment(id);

        return result && this._mapDBCommentToCommentOutputModel(result, userId);
    },

    async setComment(postId: string, newComment: CommentOutputType, userId: string): Promise<DBCommentType> {
        const user = await usersService.getUserById(userId);
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

        const result = await commentsLocalRepository.createComment(comment);

        return this._mapDBCommentToCommentOutputModel(result, userId);
    },

    async editComment(id: string, newComment: CommentOutputType): Promise<void> {
        await commentsLocalRepository.updateComment(id, {
            content: newComment.content
        });
    },

    async editCommentLikesInfo(id: string, likeStatus: LikeStatusesType, userId: string): Promise<void> {
        const result = await commentsLocalRepository.findComment(id);
        const user = await usersService.getUserById(userId);

        if (result && user) {
            let likes = result.likesInfo.likes!.filter(like => like.userId !== userId);
            let dislikes = result.likesInfo.dislikes!.filter(dislike => dislike.userId !== userId);

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

            await commentsLocalRepository.updateCommentLikesInfo(id, likes, dislikes);
        }
    },

    async deleteComment(id: string): Promise<void> {
        await commentsLocalRepository.removeComment(id);
    },

    async deleteAll(): Promise<void> {
        await commentsLocalRepository.removeAll();
    }
};
