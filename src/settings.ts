import { Express, Request, Response } from 'express';
import { videosLocalRepository } from './repositories/videos-repository';
import { blogsLocalRepository } from './repositories/blogs-repository';
import { CodeResponsesEnum } from './types';
import { postsLocalRepository } from './repositories/posts-repository';

export const getAppRouter = (app: Express) => {
    app.get('/', (req: Request, res: Response) => {
        res.send('Hello back-end HomeWorks in it-incubator!!!');
    });

    app.delete('/testing/all-data', (req: Request, res: Response) => {
        videosLocalRepository.deleteAll();
        blogsLocalRepository.deleteAll();
        postsLocalRepository.deleteAll();
        res.sendStatus(CodeResponsesEnum.Not_content_204);
    });
};
