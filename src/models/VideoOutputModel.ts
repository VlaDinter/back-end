import { AvailableResolutionsModel } from './AvailableResolutionsModel';

export type VideoOutputModel = {
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    publicationDate?: string,
    availableResolutions?: AvailableResolutionsModel[] | null
};
