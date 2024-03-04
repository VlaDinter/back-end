import { SortDirectionType } from './SortDirectionType';

export type FiltersType = {
    postId?: string,
    blogId?: string,
    searchNameTerm?: string | null,
    searchLoginTerm?: string | null,
    searchEmailTerm?: string | null,
    sortBy: string,
    sortDirection: SortDirectionType.ASC | SortDirectionType.DESC,
    pageNumber: number,
    pageSize: number
};
