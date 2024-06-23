import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { CommentsService } from '../domain/comments-service';

@injectable()
export class CommentsController {
    constructor(
        @inject(CommentsService) protected commentsService: CommentsService
    ) {}

    async getComment(req: Request, res: Response) {
        const foundComment = await this.commentsService.getComment(req.params.id, req.userId as string);

        if (!foundComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(foundComment);
        }
    }

    async putComment(req: Request, res: Response) {
        const foundComment = await this.commentsService.getComment(req.params.commentId);

        if (!foundComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else if (foundComment.commentatorInfo.userId !== req.userId) {
            res.send(CodeResponsesEnum.Forbidden_403);
        } else {
            await this.commentsService.editComment(req.params.commentId, req.body);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async putLikeStatus(req: Request, res: Response) {
        const foundComment = await this.commentsService.getComment(req.params.commentId);

        if (!foundComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            await this.commentsService.editCommentLikesInfo(req.params.commentId, req.body.likeStatus, req.userId as string);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async deleteComment(req: Request, res: Response) {
        const foundComment = await this.commentsService.getComment(req.params.commentId);

        if (!foundComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else if (foundComment.commentatorInfo.userId !== req.userId) {
            res.send(CodeResponsesEnum.Forbidden_403);
        } else {
            await this.commentsService.removeComment(req.params.commentId);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
}
