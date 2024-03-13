import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { postsService } from '../domain/posts-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { commentValidation } from './comments-router';
import { userIdMiddleware } from '../middlewares/user-id-middleware';

export const postsRouter = Router({});

export const titleValidation = body('title').isString().withMessage('title is invalid').trim().notEmpty().withMessage('title is required').isLength({ max: 30 }).withMessage('title is too long');
export const shortDescriptionValidation = body('shortDescription').isString().withMessage('short description is invalid').trim().notEmpty().withMessage('short description is required').isLength({ max: 100 }).withMessage('short description is too long');
export const contentValidation = body('content').isString().withMessage('content is invalid').trim().notEmpty().withMessage('content is required').isLength({ max: 1000 }).withMessage('content is too long');
const blogIdValidation = body('blogId').notEmpty().withMessage('blog id is required').custom(async blogId => {
    const foundBlog = await blogsLocalRepository.findBlog(blogId);

    if (!foundBlog) {
        throw new Error('blog id is invalid');
    }

    return true;
});

postsRouter.get('/', async (req: Request, res: Response) => {
    const foundPosts = await postsService.getPosts(req.query);

    res.send(foundPosts);
});

postsRouter.get('/:postId', async (req: Request, res: Response) => {
    const foundPost = await postsService.getPost(req.params.postId);

    if (!foundPost) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(foundPost);
    }
});

postsRouter.post('/',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const createdPost = await postsService.setPost(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdPost);
    }
);

postsRouter.put('/:postId',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const updatedPost = await postsService.editPost(req.params.postId, req.body);

        if (!updatedPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

postsRouter.delete('/:postId', authorizationMiddleware, async (req: Request, res: Response) => {
    const deletedPost = await postsService.deletePost(req.params.postId);

    if (!deletedPost) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});

postsRouter.get('/:postId/comments', userIdMiddleware, async (req: Request, res: Response) => {
    const foundComments = await postsService.getComments(req.params.postId, req.query, req.userId as string);

    if (!foundComments) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(foundComments);
    }
});

postsRouter.post('/:postId/comments',
    authMiddleware,
    commentValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const createdComment = await postsService.setComment(req.params.postId, req.body, req.userId as string);

        if (!createdComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.status(CodeResponsesEnum.Created_201).send(createdComment);
        }
    }
);
