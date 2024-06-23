import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { PostsService } from '../domain/posts-service';

@injectable()
export class PostsController {
    constructor(
        @inject(PostsService) protected postsService: PostsService
    ) {}

    async getPosts(req: Request, res: Response) {
        const foundPosts = await this.postsService.getPosts(req.query, req.userId as string);

        res.send(foundPosts);
    }

    async getPost(req: Request, res: Response) {
        const foundPost = await this.postsService.getPost(req.params.postId, req.userId as string);

        if (!foundPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(foundPost);
        }
    }

    async postPosts(req: Request, res: Response) {
        const createdPost = await this.postsService.addPost(req.body, req.userId as string);

        res.status(CodeResponsesEnum.Created_201).send(createdPost);
    }

    async putPost(req: Request, res: Response) {
        const updatedPost = await this.postsService.editPost(req.params.postId, req.body);

        if (!updatedPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async putLikeStatus(req: Request, res: Response) {
        const foundPost = await this.postsService.getPost(req.params.postId);

        if (!foundPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            await this.postsService.editPostExtendedLikesInfo(req.params.postId, req.body.likeStatus, req.userId as string);

            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async deletePost(req: Request, res: Response) {
        const deletedPost = await this.postsService.removePost(req.params.postId);

        if (!deletedPost) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }

    async getComments(req: Request, res: Response) {
        const foundComments = await this.postsService.getComments(req.params.postId, req.query, req.userId as string);

        if (!foundComments) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(foundComments);
        }
    }

    async postComments(req: Request, res: Response) {
        const createdComment = await this.postsService.addComment(req.params.postId, req.body, req.userId as string);

        if (!createdComment) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.status(CodeResponsesEnum.Created_201).send(createdComment);
        }
    }
}
