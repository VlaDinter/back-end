import { Router } from 'express';
import { body } from 'express-validator';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { AvailableResolutionsEnum } from '../types/AvailableResolutionsEnum';
import { AvailableResolutionsType } from '../types/AvailableResolutionsType';
import { VideosController } from '../controllers/videos-controller';
import { container } from '../features/composition-root';

const videosController = container.resolve(VideosController);

export const videosRouter = Router({});

const titleValidation = body('title').isString().withMessage('title is invalid').trim().notEmpty().withMessage('title is required').isLength({ max: 40 }).withMessage('title is too long');
const authorValidation = body('author').isString().withMessage('author is invalid').trim().notEmpty().withMessage('author is required').isLength({ max: 20 }).withMessage('author is too long');
const canBeDownloadedValidation = body('canBeDownloaded', 'can be downloaded is invalid').optional().isBoolean({ strict: true });
const minAgeRestrictionValidation = body('minAgeRestriction', 'min age restriction is invalid').optional({ nullable: true }).not().isString().not().isArray().isInt({ min: 1, max: 18 });
const publicationDateValidation = body('publicationDate', 'publication date is invalid').optional().not().isArray().isISO8601();
const availableResolutionsValidation = body('availableResolutions', 'available resolutions is invalid').optional({ nullable: true }).isArray().custom(value => {
    const validValues = [
        AvailableResolutionsEnum.P144,
        AvailableResolutionsEnum.P240,
        AvailableResolutionsEnum.P360,
        AvailableResolutionsEnum.P480,
        AvailableResolutionsEnum.P720,
        AvailableResolutionsEnum.P1080,
        AvailableResolutionsEnum.P1440,
        AvailableResolutionsEnum.P2160
    ];

    const isInvalid = value.some((item: AvailableResolutionsType) => !validValues.includes(item));

    if (isInvalid || !value.length) {
        return false;
    }

    return true;
});

videosRouter.get('/', videosController.getVideos.bind(videosController));
videosRouter.get('/:videoId', videosController.getVideo.bind(videosController));
videosRouter.post('/',
    titleValidation,
    authorValidation,
    canBeDownloadedValidation,
    minAgeRestrictionValidation,
    publicationDateValidation,
    availableResolutionsValidation,
    inputValidationMiddleware,
    videosController.postVideos.bind(videosController)
);

videosRouter.put('/:videoId',
    titleValidation,
    authorValidation,
    canBeDownloadedValidation,
    minAgeRestrictionValidation,
    publicationDateValidation,
    availableResolutionsValidation,
    inputValidationMiddleware,
    videosController.putVideo.bind(videosController)
);

videosRouter.delete('/:videoId', videosController.deleteVideo.bind(videosController));
