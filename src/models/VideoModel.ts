import { AvailableResolutionsModel } from './AvailableResolutionsModel';

export type VideoModel = {
    id?: number,
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    createdAt?: string,
    publicationDate?: string,
    availableResolutions?: Array<AvailableResolutionsModel> | null
};
