import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { videosLocalRepository } from '../repositories/videos-repository';

export const videosRouter = Router({});

const titleValidation = body('title').isString().withMessage('title is invalid').trim().notEmpty().withMessage('title is required').isLength({ max: 40 }).withMessage('title is too long');
const authorValidation = body('author').isString().withMessage('author is invalid').trim().notEmpty().withMessage('author is required').isLength({ max: 20 }).withMessage('author is too long');
const canBeDownloadedValidation = body('canBeDownloaded', 'can be downloaded is invalid').optional().isBoolean({ strict: true });
const minAgeRestrictionValidation = body('minAgeRestriction', 'min age restriction is invalid').optional({ nullable: true }).not().isString().not().isArray().isInt({ min: 1, max: 18 });
const publicationDateValidation = body('publicationDate', 'publication date is invalid').optional().not().isArray().isISO8601();
const availableResolutionsValidation = body('availableResolutions', 'available resolutions is invalid').optional({ nullable: true }).isArray().custom(value => {
    const validValues = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'];
    const isInvalid = value.some((item: string) => !validValues.includes(item));

    if (isInvalid || !value.length) {
        return false;
    }

    return true;
});

videosRouter.get('/', (req: Request, res: Response) => {
    const foundVideos = videosLocalRepository.findVideos();

    res.send(foundVideos);
});

videosRouter.get('/:videoId', (req: Request, res: Response) => {
    const video = videosLocalRepository.findVideo(+req.params.videoId);

    if (!video) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(video);
    }
});

videosRouter.post('/',
    titleValidation,
    authorValidation,
    canBeDownloadedValidation,
    minAgeRestrictionValidation,
    publicationDateValidation,
    availableResolutionsValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const newVideo = videosLocalRepository.createVideo(req.body);

        res.status(CodeResponsesEnum.Created_201).send(newVideo);
    }
);

videosRouter.put('/:videoId',
    titleValidation,
    authorValidation,
    canBeDownloadedValidation,
    minAgeRestrictionValidation,
    publicationDateValidation,
    availableResolutionsValidation,
    inputValidationMiddleware,
    (req: Request, res: Response) => {
        const updatedVideo = videosLocalRepository.updateVideo(+req.params.videoId, req.body);

        if (!updatedVideo) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

videosRouter.delete('/:videoId', (req: Request, res: Response) => {
    const deletedVideo = videosLocalRepository.removeVideo(+req.params.videoId);

    if (!deletedVideo) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});
