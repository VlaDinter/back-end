import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { PostsService } from '../domain/posts-service';
import { VideosService } from '../domain/videos-service';
import { BlogsService } from '../domain/blogs-service';
import { UsersService } from '../domain/users-service';
import { CommentsService } from '../domain/comments-service';
import { DevicesService } from '../domain/devices-service';
import { RequestsService } from '../domain/requests-service';

@injectable()
export class AppController {
    constructor(
        @inject(VideosService) protected videosService: VideosService,
        @inject(BlogsService) protected blogsService: BlogsService,
        @inject(PostsService) protected postsService: PostsService,
        @inject(UsersService) protected usersService: UsersService,
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(DevicesService) protected devicesService: DevicesService,
        @inject(RequestsService) protected requestsService: RequestsService
    ) {}

    getHello(req: Request, res: Response) {
        res.send('Hello back-end HomeWorks in it-incubator!!!');
    }

    async deleteAllData(req: Request, res: Response) {
        await this.videosService.removeAll();
        await this.blogsService.removeAll();
        await this.postsService.removeAll();
        await this.usersService.removeAll();
        await this.commentsService.removeAll();
        await this.devicesService.removeAll();
        await this.requestsService.removeAll();

        res.sendStatus(CodeResponsesEnum.Not_content_204);
    }
}
