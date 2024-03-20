import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { blogsService } from '../domain/blogs-service';
import { contentValidation, shortDescriptionValidation, titleValidation } from './posts-router';
import { userIdMiddleware } from '../middlewares/user-id-middleware';

export const blogsRouter = Router({});

const nameValidation = body('name').isString().withMessage('name is invalid').trim().notEmpty().withMessage('name is required').isLength({ max: 15 }).withMessage('name is too long');
const descriptionValidation = body('description').isString().withMessage('description is invalid').trim().notEmpty().withMessage('description is required').isLength({ max: 500 }).withMessage('description is too long');
const websiteUrlValidation = body('websiteUrl').notEmpty().withMessage('website url is required').isURL().withMessage('website url does not match the template').not().isArray().withMessage('website url is invalid').isLength({ max: 100 }).withMessage('website url is too long');

blogsRouter.get('/', async (req: Request, res: Response) => {
    const foundBlogs = await blogsService.getBlogs(req.query);

    res.send(foundBlogs);
});

blogsRouter.get('/:blogId', async (req: Request, res: Response) => {
    const foundBlog = await blogsService.getBlog(req.params.blogId);

    if (!foundBlog) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(foundBlog);
    }
});

blogsRouter.post('/',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const createdBlog = await blogsService.setBlog(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdBlog);
    }
);

blogsRouter.put('/:blogId',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const updatedBlog = await blogsService.editBlog(req.params.blogId, req.body);

        if (!updatedBlog) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

blogsRouter.delete('/:blogId', authorizationMiddleware, async (req: Request, res: Response) => {
    const deletedBlog = await blogsService.deleteBlog(req.params.blogId);

    if (!deletedBlog) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});

blogsRouter.get('/:blogId/posts', userIdMiddleware, async (req: Request, res: Response) => {
    const foundPosts = await blogsService.getPosts(req.params.blogId, req.query, req.userId as string);

    if (!foundPosts) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(foundPosts);
    }
});

blogsRouter.post('/:blogId/posts',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    inputValidationMiddleware,
    userIdMiddleware,
    async (req: Request, res: Response) => {
        const createdPost = await blogsService.setPost(req.params.blogId, req.body, req.userId as string);

        if (!createdPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.status(CodeResponsesEnum.Created_201).send(createdPost);
        }
    }
);
