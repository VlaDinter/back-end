import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { postsLocalRepository } from '../repositories/posts-repository';
import { blogsLocalRepository } from '../repositories/blogs-repository';

export const postsRouter = Router({});

const titleValidation = body('title').isString().withMessage('title is invalid').trim().notEmpty().withMessage('title is required').isLength({ max: 30 }).withMessage('title is too long');
const shortDescriptionValidation = body('shortDescription').isString().withMessage('short description is invalid').trim().notEmpty().withMessage('short description is required').isLength({ max: 100 }).withMessage('short description is too long');
const contentValidation = body('content').isString().withMessage('content is invalid').trim().notEmpty().withMessage('content is required').isLength({ max: 1000 }).withMessage('content is too long');
const blogIdValidation = body('blogId').notEmpty().withMessage('blog id is required').custom(blogId => {
    const foundBlog = blogsLocalRepository.findBlog(blogId);

    if (!foundBlog) {
        throw new Error('blog id is invalid');
    }

    return true;
});

postsRouter.get('/', (req: Request, res: Response) => {
    const foundPosts = postsLocalRepository.findPosts();

    res.send(foundPosts);
});

postsRouter.get('/:postId', (req: Request, res: Response) => {
    const post = postsLocalRepository.findPost(req.params.postId);

    if (!post) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(post);
    }
});

postsRouter.post('/',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const newPost = postsLocalRepository.createPost(req.body);

        res.status(CodeResponsesEnum.Created_201).send(newPost);
    }
);

postsRouter.put('/:postId',
    authorizationMiddleware,
    titleValidation,
    shortDescriptionValidation,
    contentValidation,
    blogIdValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const updatedPost = postsLocalRepository.updatePost(req.params.postId, req.body);

        if (!updatedPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

postsRouter.delete('/:postId', authorizationMiddleware, (req: Request, res: Response) => {
    const deletedPost = postsLocalRepository.removePost(req.params.postId);

    if (!deletedPost) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});
