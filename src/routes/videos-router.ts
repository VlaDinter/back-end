import { Router, Request, Response } from 'express';
import { videos, videosLocalRepository } from '../repositories/videos-repository';
import { CodeResponsesEnum } from '../index';

export const videosRouter = Router({});

videosRouter.get('/', (req: Request, res: Response) => {
    res.send(videos);
});

videosRouter.post('/', (req: Request, res: Response) => {
    const errors = videosLocalRepository.getErrorsMessages(req.body);

    if (!errors.errorsMessages) {
        const newVideo = {
            id: +(new Date()),
            title: req.body.title.trim(),
            author: req.body.author.trim(),
            canBeDownloaded: req.body.canBeDownloaded || false,
            minAgeRestriction: req.body.minAgeRestriction || null,
            createdAt: new Date().toISOString(),
            publicationDate: !req.body.publicationDate ?
                new Date((new Date()).setDate((new Date()).getDate() + 1)).toISOString() :
                new Date(req.body.publicationDate).toISOString(),

            availableResolutions: req.body.availableResolutions || null
        };

        videos.push(newVideo);
        res.status(CodeResponsesEnum.Created_201).send(newVideo);
    } else {
        res.status(CodeResponsesEnum.Incorrect_values_400).send(errors);
    }
});

videosRouter.get('/:videoId', (req: Request, res: Response) => {
    const id = +req.params.videoId;
    const video = videos.find(v => v.id === id);

    if (!video) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(video);
    }
});

videosRouter.put('/:videoId', (req: Request, res: Response) => {
    const id = +req.params.videoId;
    const video = videos.find(v => v.id === id);

    if (!video) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        const errors = videosLocalRepository.getErrorsMessages(req.body);

        if (!errors.errorsMessages) {
            video.title = req.body.title.trim();
            video.author = req.body.author.trim();

            if (req.body.hasOwnProperty('canBeDownloaded')) {
                video.canBeDownloaded = req.body.canBeDownloaded || false;
            }

            if (req.body.hasOwnProperty('minAgeRestriction')) {
                video.minAgeRestriction = req.body.minAgeRestriction || null;
            }

            if (req.body.hasOwnProperty('publicationDate') && req.body.publicationDate) {
                video.publicationDate = new Date(req.body.publicationDate).toISOString();
            }

            if (req.body.hasOwnProperty('availableResolutions')) {
                video.availableResolutions = req.body.availableResolutions || null;
            }

            res.send(CodeResponsesEnum.Not_content_204);
        } else {
            res.status(CodeResponsesEnum.Incorrect_values_400).send(errors);
        }
    }
});

videosRouter.delete('/:videoId', (req: Request, res: Response) => {
    const id = +req.params.videoId;
    const videoIndex = videos.findIndex(v => v.id === id);

    if (videoIndex < 0) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        videos.splice(videoIndex, 1);
        res.send(CodeResponsesEnum.Not_content_204);
    }
});
