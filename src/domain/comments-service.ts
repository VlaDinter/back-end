import { ParsedQs } from 'qs';
import { SortDirectionModel } from '../models/SortDirectionModel';
import { PaginationModel } from '../models/PaginationModel';
import { commentsLocalRepository } from '../repositories/comments-repository';
import { DBCommentModel } from '../models/DBCommentModel';
import { CommentOutputModel } from '../models/CommentOutputModel';
import { usersService } from './users-service';

export const commentsService = {
    _mapDBCommentToCommentOutputModel(dbBlog: DBCommentModel): DBCommentModel {
        return {
            id: dbBlog.id,
            content: dbBlog.content,
            commentatorInfo: dbBlog.commentatorInfo,
            createdAt: dbBlog.createdAt
        };
    },

    async getComments(queryParams: ParsedQs): Promise<PaginationModel<DBCommentModel>> {
        const filters = {
            postId: queryParams.postId as string,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionModel.ASC ? SortDirectionModel.ASC : SortDirectionModel.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await commentsLocalRepository.findComments(filters);
        const commentsCount = await commentsLocalRepository.getCommentsCount(filters);

        return {
            pagesCount: Math.ceil(commentsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: commentsCount,
            items: result.map(this._mapDBCommentToCommentOutputModel)
        };
    },

    async getComment(id: string): Promise<DBCommentModel | null> {
        const result = await commentsLocalRepository.findComment(id);

        return result && this._mapDBCommentToCommentOutputModel(result);
    },

    async setComment(userId: string, postId: string, newComment: CommentOutputModel): Promise<DBCommentModel> {
        const user = await usersService.getUserById(userId);
        const comment = {
            id: `${+(new Date())}`,
            postId,
            content: newComment.content,
            createdAt: new Date().toISOString(),
            commentatorInfo: {
                userId,
                userLogin: user!.login
            }
        };

        const result = await commentsLocalRepository.createComment(comment);

        return this._mapDBCommentToCommentOutputModel(result);
    },

    async editComment(id: string, newComment: CommentOutputModel): Promise<void> {
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
