import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { videosLocalRepository } from './repositories/videos-repository';
import { videosRouter } from './routes/videos-router';
import { CodeResponsesEnum } from './index';

export const app = express();

app.use(bodyParser({}));
app.use('/videos', videosRouter);
// app.use('/blogs', blogsRouter);
app.get('/', (req: Request, res: Response) => {
    res.send('Hello back-end HomeWorks in it-incubator!!!');
});

app.delete('/testing/all-data', (req: Request, res: Response) => {
    videosLocalRepository.deleteAll();
    // await blogsLocalRepository.deleteAll();
    res.sendStatus(CodeResponsesEnum.Not_content_204);
});
