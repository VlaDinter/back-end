import { AvailableResolutionsType } from './AvailableResolutionsType';

export type DBVideoType = {
    id?: number,
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    createdAt?: string,
    publicationDate?: string,
    availableResolutions?: AvailableResolutionsType[] | null
};
