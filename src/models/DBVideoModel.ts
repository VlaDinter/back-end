import { AvailableResolutionsModel } from './AvailableResolutionsModel';

export type DBVideoModel = {
    id?: number,
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    createdAt?: string,
    publicationDate?: string,
    availableResolutions?: AvailableResolutionsModel[] | null
};
