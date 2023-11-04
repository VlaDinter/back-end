import { AvailableResolutionsModel } from './AvailableResolutionsModel';

export type VideoOutputModel = {
    id?: number,
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    createdAt?: string,
    publicationDate?: string,
    availableResolutions?: Array<AvailableResolutionsModel> | null
};
