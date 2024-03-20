import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { commentsService } from '../domain/comments-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { LikeStatusType } from '../types/LikeStatusType';
import { userIdMiddleware } from '../middlewares/user-id-middleware';

export const commentsRouter = Router({});

export const commentValidation = body('content').isString().withMessage('content is invalid').trim().notEmpty().withMessage('content is required').isLength({ min: 20, max: 300 }).withMessage('content is too long');
export const likeValidation = body('likeStatus').isString().withMessage('like status is invalid').trim().notEmpty().withMessage('like status is required').custom(likeStatus => {
    const statuses = [LikeStatusType.None, LikeStatusType.Like, LikeStatusType.Dislike];

    if (!statuses.includes(likeStatus)) throw new Error('like status is incorrect');

    return true;
});

commentsRouter.get('/:id', userIdMiddleware, async (req: Request, res: Response) => {
    const foundComment = await commentsService.getComment(req.params.id, req.userId as string);

    if (!foundComment) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(foundComment);
    }
});

commentsRouter.put('/:commentId',
    authMiddleware,
    commentValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const foundComment = await commentsService.getComment(req.params.commentId);

        if (!foundComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else if (foundComment.commentatorInfo.userId !== req.userId) {
            res.send(CodeResponsesEnum.Forbidden_403);
        } else {
            await commentsService.editComment(req.params.commentId, req.body);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

commentsRouter.put('/:commentId/like-status',
    authMiddleware,
    likeValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const foundComment = await commentsService.getComment(req.params.commentId);

        if (!foundComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            await commentsService.editCommentLikesInfo(req.params.commentId, req.body.likeStatus, req.userId as string);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

commentsRouter.delete('/:commentId', authMiddleware, async (req: Request, res: Response) => {
    const foundComment = await commentsService.getComment(req.params.commentId);

    if (!foundComment) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else if (foundComment.commentatorInfo.userId !== req.userId) {
        res.send(CodeResponsesEnum.Forbidden_403);
    } else {
        await commentsService.deleteComment(req.params.commentId);

        res.send(CodeResponsesEnum.Not_content_204);
    }
});
