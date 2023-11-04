import { AvailableResolutionsModel } from './AvailableResolutionsModel';

export type VideoModel = {
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    publicationDate?: string,
    availableResolutions?: Array<AvailableResolutionsModel> | null
};
