import { Express, Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { videosService } from '../domain/videos-service';
import { blogsService } from '../domain/blogs-service';
import { postsService } from '../domain/posts-service';
import { usersService } from '../domain/users-service';
import { commentsService } from '../domain/comments-service';

export const getAppRouter = (app: Express) => {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello back-end HomeWorks in it-incubator!!!');
    });

    app.delete('/testing/all-data', async (req: Request, res: Response) => {
        await videosService.deleteAll();
        await blogsService.deleteAll();
        await postsService.deleteAll();
        await usersService.deleteAll();
        await commentsService.deleteAll();
        res.sendStatus(CodeResponsesEnum.Not_content_204);
    });
};