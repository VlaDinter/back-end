import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { blogsLocalRepository } from '../repositories/blogs-repository';
import { CodeResponsesEnum } from '../types';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';

export const blogsRouter = Router({});

const nameValidation = body('name').isString().withMessage('name is invalid').trim().notEmpty().withMessage('name is required').isLength({ max: 15 }).withMessage('name is too long');
const descriptionValidation = body('description').isString().withMessage('description is invalid').trim().notEmpty().withMessage('description is required').isLength({ max: 500 }).withMessage('description is too long');
const websiteUrlValidation = body('websiteUrl').notEmpty().withMessage('website url is required').isURL().withMessage('website url does not match the template').not().isArray().withMessage('website url is invalid').isLength({ max: 100 }).withMessage('website url is too long');

blogsRouter.get('/', (req: Request, res: Response) => {
    const foundBlogs = blogsLocalRepository.findBlogs();

    res.send(foundBlogs);
});

blogsRouter.get('/:blogId', (req: Request, res: Response) => {
    const blog = blogsLocalRepository.findBlog(req.params.blogId);

    if (!blog) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(blog);
    }
});

blogsRouter.post('/',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const newBlog = blogsLocalRepository.createBlog(req.body);

        res.status(CodeResponsesEnum.Created_201).send(newBlog);
    }
);

blogsRouter.put('/:blogId',
    authorizationMiddleware,
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const updatedBlog = blogsLocalRepository.updateBlog(req.params.blogId, req.body);

        if (!updatedBlog) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

blogsRouter.delete('/:blogId', authorizationMiddleware, (req: Request, res: Response) => {
    const deletedBlog = blogsLocalRepository.removeBlog(req.params.blogId);

    if (!deletedBlog) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});
