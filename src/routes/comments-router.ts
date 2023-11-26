import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { commentsService } from '../domain/comments-service';
import { authMiddleware } from '../middlewares/auth-middleware';

export const commentsRouter = Router({});

export const commentValidation = body('comment').isString().withMessage('comment is invalid').trim().notEmpty().withMessage('comment is required').isLength({ min: 20, max: 300 }).withMessage('comment is too long');

commentsRouter.get('/:id', async (req: Request, res: Response) => {
    const foundComment = await commentsService.getComment(req.params.id);

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
