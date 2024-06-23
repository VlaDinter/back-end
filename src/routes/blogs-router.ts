import { Router } from 'express';
import { body } from 'express-validator';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { contentValidation, shortDescriptionValidation, titleValidation } from './posts-router';
import { userIdMiddleware } from '../middlewares/user-id-middleware';
import { BlogsController } from '../controllers/blogs-controller';
import { container } from '../features/composition-root';

const blogsController = container.resolve(BlogsController);

export const blogsRouter = Router({});

const nameValidation = body('name').isString().withMessage('name is invalid').trim().notEmpty().withMessage('name is required').isLength({ max: 15 }).withMessage('name is too long');
const descriptionValidation = body('description').isString().withMessage('description is invalid').trim().notEmpty().withMessage('description is required').isLength({ max: 500 }).withMessage('description is too long');
const websiteUrlValidation = body('websiteUrl').notEmpty().withMessage('website url is required').isURL().withMessage('website url does not match the template').not().isArray().withMessage('website url is invalid').isLength({ max: 100 }).withMessage('website url is too long');

blogsRouter.get('/', blogsController.getBlogs.bind(blogsController));
blogsRouter.get('/:blogId', blogsController.getBlog.bind(blogsController));
blogsRouter.post('/',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    blogsController.postBlogs.bind(blogsController)
);

blogsRouter.put('/:blogId',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    blogsController.putBlog.bind(blogsController)
);

blogsRouter.delete('/:blogId', authorizationMiddleware,  blogsController.deleteBlog.bind(blogsController));
blogsRouter.get('/:blogId/posts', userIdMiddleware,  blogsController.getPosts.bind(blogsController));
blogsRouter.post('/:blogId/posts',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    inputValidationMiddleware,
    userIdMiddleware,
    blogsController.postPosts.bind(blogsController)
);
