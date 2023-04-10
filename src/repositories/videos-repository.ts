type FieldErrorType = {
    message: string | null;
    field: string | null;
};

type ErrorsMessagesType = {
    errorsMessages: FieldErrorType[] | null;
};

enum AvailableResolutionsEnum {
    P144 = 'P144',
    P240 = 'P240',
    P360 = 'P360',
    P480 = 'P480',
    P720 = 'P720',
    P1080 = 'P1080',
    P1440 = 'P1440',
    P2160 = 'P2160'
}

export type VideoType = {
    id: number;
    title: string;
    author: string;
    canBeDownloaded: boolean;
    minAgeRestriction: number | null;
    createdAt: string;
    publicationDate: string;
    availableResolutions: Array<
        AvailableResolutionsEnum.P144 |
        AvailableResolutionsEnum.P240 |
        AvailableResolutionsEnum.P360 |
        AvailableResolutionsEnum.P480 |
        AvailableResolutionsEnum.P720 |
        AvailableResolutionsEnum.P1080 |
        AvailableResolutionsEnum.P1440 |
        AvailableResolutionsEnum.P2160
    > | null;
};

export let videos: VideoType[] = [];

export const videosLocalRepository = {
    deleteAll(): void {
        videos = [];
    },

    getErrorsMessages(video: VideoType): ErrorsMessagesType {
        const errorsMessages = [];
        const {
            title,
            author,
            canBeDownloaded,
            minAgeRestriction,
            publicationDate,
            availableResolutions
        } = video;

        if (!title) {
            errorsMessages.push({
                message: 'title is required',
                field: 'title'
            });
        }

        if (title && (typeof title !== 'string' || !title.trim() || title.length > 40)) {
            errorsMessages.push({
                message: 'invalid title format',
                field: 'title'
            });
        }

        if (!author) {
            errorsMessages.push({
                message: 'author is required',
                field: 'author'
            });
        }

        if (author && (typeof author !== 'string' || !author.trim() || author.length > 20)) {
            errorsMessages.push({
                message: 'invalid author format',
                field: 'author'
            });
        }

        if (canBeDownloaded && typeof canBeDownloaded !== 'boolean') {
            errorsMessages.push({
                message: 'invalid can be downloaded format',
                field: 'canBeDownloaded'
            });
        }

        if (minAgeRestriction && typeof minAgeRestriction !== 'number') {
            errorsMessages.push({
                message: 'invalid min age restriction format',
                field: 'minAgeRestriction'
            });
        }

        if (typeof minAgeRestriction === 'number' && minAgeRestriction < 1) {
            errorsMessages.push({
                message: 'min age restriction must be 1 or greater',
                field: 'minAgeRestriction'
            });
        }

        if (typeof minAgeRestriction === 'number' && minAgeRestriction > 18) {
            errorsMessages.push({
                message: 'min age restriction must be 18 or smaller',
                field: 'minAgeRestriction'
            });
        }

        if (
            publicationDate &&
            (
                typeof publicationDate !== 'string' ||
                isNaN(Date.parse(publicationDate))
            )
        ) {
            errorsMessages.push({
                message: 'invalid publication date format',
                field: 'publicationDate'
            });
        }

        if (
            availableResolutions &&
            (
                !Array.isArray(availableResolutions) ||
                !availableResolutions.length ||
                availableResolutions.some(resolution => !AvailableResolutionsEnum[resolution])
            )
        ) {
            errorsMessages.push({
                message: 'invalid available resolutions format',
                field: 'availableResolutions'
            });
        }

        if (!errorsMessages.length) {
            return { errorsMessages: null };
        }

        return { errorsMessages };
    }
};
