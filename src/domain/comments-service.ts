import { ParsedQs } from 'qs';
import { SortDirectionType } from '../types/SortDirectionType';
import { PaginationType } from '../types/PaginationType';
import { commentsLocalRepository } from '../repositories/comments-repository';
import { DBCommentType } from '../types/DBCommentType';
import { CommentOutputType } from '../types/CommentOutputType';
import { usersService } from './users-service';

export const commentsService = {
    _mapDBCommentToCommentOutputModel(dbBlog: DBCommentType): DBCommentType {
        return {
            id: dbBlog.id,
            content: dbBlog.content,
            commentatorInfo: dbBlog.commentatorInfo,
            createdAt: dbBlog.createdAt
        };
    },

    async getComments(postId: string, queryParams: ParsedQs): Promise<PaginationType<DBCommentType>> {
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
            items: result.map(this._mapDBCommentToCommentOutputModel)
        };
    },

    async getComment(id: string): Promise<DBCommentType | null> {
        const result = await commentsLocalRepository.findComment(id);

        return result && this._mapDBCommentToCommentOutputModel(result);
    },

    async setComment(userId: string, postId: string, newComment: CommentOutputType): Promise<DBCommentType> {
        const user = await usersService.getUserById(userId);
        const comment = {
            id: `${+(new Date())}`,
            postId,
            content: newComment.content,
            commentatorInfo: {
                userId,
                userLogin: user!.login
            }
        };

        const result = await commentsLocalRepository.createComment(comment);

        return this._mapDBCommentToCommentOutputModel(result);
    },

    async editComment(id: string, newComment: CommentOutputType): Promise<void> {
        await commentsLocalRepository.updateComment(id, {
            content: newComment.content
        });
    },

    async deleteComment(id: string): Promise<void> {
        await commentsLocalRepository.removeComment(id);
    },

    async deleteAll(): Promise<void> {
        await commentsLocalRepository.removeAll();
    }
};
