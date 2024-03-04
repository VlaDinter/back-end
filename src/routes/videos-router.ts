import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { videosService } from '../domain/videos-service';
import { AvailableResolutionType } from '../types/AvailableResolutionType';
import { AvailableResolutionsType } from '../types/AvailableResolutionsType';

export const videosRouter = Router({});

const titleValidation = body('title').isString().withMessage('title is invalid').trim().notEmpty().withMessage('title is required').isLength({ max: 40 }).withMessage('title is too long');
const authorValidation = body('author').isString().withMessage('author is invalid').trim().notEmpty().withMessage('author is required').isLength({ max: 20 }).withMessage('author is too long');
const canBeDownloadedValidation = body('canBeDownloaded', 'can be downloaded is invalid').optional().isBoolean({ strict: true });
const minAgeRestrictionValidation = body('minAgeRestriction', 'min age restriction is invalid').optional({ nullable: true }).not().isString().not().isArray().isInt({ min: 1, max: 18 });
const publicationDateValidation = body('publicationDate', 'publication date is invalid').optional().not().isArray().isISO8601();
const availableResolutionsValidation = body('availableResolutions', 'available resolutions is invalid').optional({ nullable: true }).isArray().custom(value => {
    const validValues = [
        AvailableResolutionType.P144,
        AvailableResolutionType.P240,
        AvailableResolutionType.P360,
        AvailableResolutionType.P480,
        AvailableResolutionType.P720,
        AvailableResolutionType.P1080,
        AvailableResolutionType.P1440,
        AvailableResolutionType.P2160
    ];

    const isInvalid = value.some((item: AvailableResolutionsType) => !validValues.includes(item));

    if (isInvalid || !value.length) {
        return false;
    }

    return true;
});

videosRouter.get('/', async (req: Request, res: Response) => {
    const foundVideos = await videosService.getVideos();

    res.send(foundVideos);
});

videosRouter.get('/:videoId', async (req: Request, res: Response) => {
    const foundVideo = await videosService.getVideo(+req.params.videoId);

    if (!foundVideo) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(foundVideo);
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
    async (req: Request, res: Response) => {
        const createdVideo = await videosService.setVideo(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdVideo);
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
    async (req: Request, res: Response) => {
        const updatedVideo = await videosService.editVideo(+req.params.videoId, req.body);

        if (!updatedVideo) {
            res.send(CodeResponsesEnum.Not_found_404);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);

videosRouter.delete('/:videoId', async (req: Request, res: Response) => {
    const deletedVideo = await videosService.deleteVideo(+req.params.videoId);

    if (!deletedVideo) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});
