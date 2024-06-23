import { AvailableResolutionsType } from './AvailableResolutionsType';

export type VideoType = {
    title: string,
    author: string,
    canBeDownloaded?: boolean,
    minAgeRestriction?: number | null,
    publicationDate?: string,
    availableResolutions?: AvailableResolutionsType[] | null
};
