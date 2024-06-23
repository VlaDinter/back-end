import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { BlogsService } from '../domain/blogs-service';

@injectable()
export class BlogsController {
    constructor(
        @inject(BlogsService) protected blogsService: BlogsService
    ) {}

    async getBlogs(req: Request, res: Response) {
        const foundBlogs = await this.blogsService.getBlogs(req.query);

        res.send(foundBlogs);
    }

    async getBlog(req: Request, res: Response) {
        const foundBlog = await this.blogsService.getBlog(req.params.blogId);

        if (!foundBlog) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(foundBlog);
        }
    }

    async postBlogs(req: Request, res: Response) {
        const createdBlog = await this.blogsService.addBlog(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdBlog);
    }

    async putBlog(req: Request, res: Response) {
        const updatedBlog = await this.blogsService.editBlog(req.params.blogId, req.body);

        if (!updatedBlog) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async deleteBlog(req: Request, res: Response) {
        const deletedBlog = await this.blogsService.removeBlog(req.params.blogId);

        if (!deletedBlog) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async getPosts(req: Request, res: Response) {
        const foundPosts = await this.blogsService.getPosts(req.params.blogId, req.query, req.userId as string);

        if (!foundPosts) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(foundPosts);
        }
    }

    async postPosts(req: Request, res: Response) {
        const createdPost = await this.blogsService.addPost(req.params.blogId, req.body, req.userId as string);

        if (!createdPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.status(CodeResponsesEnum.Created_201).send(createdPost);
        }
    }
}
