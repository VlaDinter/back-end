import { SortDirectionEnum } from './SortDirectionEnum';

export type FiltersType = {
    postId?: string,
    blogId?: string,
    searchNameTerm?: string | null,
    searchLoginTerm?: string | null,
    searchEmailTerm?: string | null,
    sortBy: string,
    sortDirection: SortDirectionEnum.ASC | SortDirectionEnum.DESC,
    pageNumber: number,
    pageSize: number
};
