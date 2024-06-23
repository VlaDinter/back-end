import { Router } from 'express';
import { body } from 'express-validator';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { authMiddleware } from '../middlewares/auth-middleware';
import { userIdMiddleware } from '../middlewares/user-id-middleware';
import { LikeStatusEnum } from '../types/LikeStatusEnum';
import { CommentsController } from '../controllers/comments-controller';
import { container } from '../features/composition-root';

const commentsController = container.resolve(CommentsController);

export const commentsRouter = Router({});

export const commentValidation = body('content').isString().withMessage('content is invalid').trim().notEmpty().withMessage('content is required').isLength({ min: 20, max: 300 }).withMessage('content is too long');
export const likeValidation = body('likeStatus').isString().withMessage('like status is invalid').trim().notEmpty().withMessage('like status is required').custom(likeStatus => {
    const statuses = [LikeStatusEnum.None, LikeStatusEnum.Like, LikeStatusEnum.Dislike];

    if (!statuses.includes(likeStatus)) throw new Error('like status is incorrect');

    return true;
});

commentsRouter.get('/:id', userIdMiddleware, commentsController.getComment.bind(commentsController));
commentsRouter.put('/:commentId',
    authMiddleware,
    commentValidation,
    inputValidationMiddleware,
    commentsController.putComment.bind(commentsController)
);

commentsRouter.put('/:commentId/like-status',
    authMiddleware,
    likeValidation,
    inputValidationMiddleware,
    commentsController.putLikeStatus.bind(commentsController)
);

commentsRouter.delete('/:commentId', authMiddleware, commentsController.deleteComment.bind(commentsController));
