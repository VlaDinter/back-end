import { Router } from 'express';
import { body } from 'express-validator';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { authMiddleware } from '../middlewares/auth-middleware';
import { commentValidation, likeValidation } from './comments-router';
import { userIdMiddleware } from '../middlewares/user-id-middleware';
import { PostsController } from '../controllers/posts-controller';
import { BlogsService } from '../domain/blogs-service';
import { container } from '../features/composition-root';

const postsController = container.resolve(PostsController);
const blogsService = container.get(BlogsService);

export const postsRouter = Router({});

export const titleValidation = body('title').isString().withMessage('title is invalid').trim().notEmpty().withMessage('title is required').isLength({ max: 30 }).withMessage('title is too long');
export const shortDescriptionValidation = body('shortDescription').isString().withMessage('short description is invalid').trim().notEmpty().withMessage('short description is required').isLength({ max: 100 }).withMessage('short description is too long');
export const contentValidation = body('content').isString().withMessage('content is invalid').trim().notEmpty().withMessage('content is required').isLength({ max: 1000 }).withMessage('content is too long');
const blogIdValidation = body('blogId').notEmpty().withMessage('blog id is required').custom(async blogId => {
    const foundBlog = await blogsService.getBlog(blogId);

    if (!foundBlog) {
        throw new Error('blog id is invalid');
    }

    return true;
});

postsRouter.get('/', userIdMiddleware, postsController.getPosts.bind(postsController));
postsRouter.get('/:postId', userIdMiddleware, postsController.getPost.bind(postsController));
postsRouter.post('/',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    userIdMiddleware,
    postsController.postPosts.bind(postsController)
);

postsRouter.put('/:postId',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    postsController.putPost.bind(postsController)
);

postsRouter.put('/:postId/like-status',
    authMiddleware,
    likeValidation,
    inputValidationMiddleware,
    postsController.putLikeStatus.bind(postsController)
);

postsRouter.delete('/:postId', authorizationMiddleware, postsController.deletePost.bind(postsController));
postsRouter.get('/:postId/comments', userIdMiddleware, postsController.getComments.bind(postsController));
postsRouter.post('/:postId/comments',
    authMiddleware,
    commentValidation,
    inputValidationMiddleware,
    postsController.postComments.bind(postsController)
);
