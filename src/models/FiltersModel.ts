import { SortDirectionModel } from './SortDirectionModel';

export type FiltersModel = {
    blogId?: string | null,
    searchNameTerm?: string | null,
    searchLoginTerm?: string | null,
    searchEmailTerm?: string | null,
    sortBy: string,
    sortDirection: SortDirectionModel.ASC | SortDirectionModel.DESC,
    pageNumber: number,
    pageSize: number
};
