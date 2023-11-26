import { ParsedQs } from 'qs';
import { SortDirectionModel } from '../models/SortDirectionModel';
import { PaginationModel } from '../models/PaginationModel';
import { usersLocalRepository } from '../repositories/users-repository';
import { DBUserModel } from '../models/DBUserModel';
import { UserOutputModel } from '../models/UserOutputModel';
import bcrypt from 'bcrypt';
import { LoginOutputModel } from '../models/LoginOutputModel';
import { MeOutputModel } from '../models/MeOutputModel';

export const usersService = {
    async _generateHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt);

        return hash;
    },

    _mapDBUserToUserOutputModel(dbUser: DBUserModel): DBUserModel {
        return {
            id: dbUser.id,
            login: dbUser.login,
            email: dbUser.email,
            createdAt: dbUser.createdAt
        };
    },

    _mapDBUserToMeOutputModel(dbUser: DBUserModel): MeOutputModel {
        return {
            userId: dbUser.id,
            email: dbUser.email,
            login: dbUser.login,
        };
    },

    async getUsers(queryParams: ParsedQs): Promise<PaginationModel<DBUserModel>> {
        const filters = {
            searchLoginTerm: typeof queryParams.searchLoginTerm === 'string' ? queryParams.searchLoginTerm : null,
            searchEmailTerm: typeof queryParams.searchEmailTerm === 'string' ? queryParams.searchEmailTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionModel.ASC ? SortDirectionModel.ASC : SortDirectionModel.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await usersLocalRepository.findUsers(filters);
        const postsCount = await usersLocalRepository.getUsersCount(filters);

        return {
            pagesCount: Math.ceil(postsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: postsCount,
            items: result.map(this._mapDBUserToUserOutputModel)
        };
    },

    async getUserById(id: string): Promise<MeOutputModel | null> {
        const result = await usersLocalRepository.findUserById(id);

        return result && this._mapDBUserToMeOutputModel(result);
    },

    async setUser(newUser: UserOutputModel): Promise<DBUserModel> {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(newUser.password, passwordSalt);
        const user = {
            id: `${+(new Date())}`,
            login: newUser.login,
            email: newUser.email,
            passwordSalt,
            passwordHash,
            createdAt: new Date().toISOString()
        };

        const result = await usersLocalRepository.createUser(user);

        return this._mapDBUserToUserOutputModel(result);
    },

    async checkCredentials(credentials: LoginOutputModel): Promise<DBUserModel | null> {
        const result = await usersLocalRepository.findByLoginOrEmail(credentials.loginOrEmail);

        if (!result || !result.passwordHash) return null;

        const checkedCredentials = await bcrypt.compare(credentials.password, result.passwordHash);

        if (!checkedCredentials) {
            return null;
        }

        return result && this._mapDBUserToUserOutputModel(result);
    },

    async deleteUser(id: string): Promise<DBUserModel | null> {
        const result = await usersLocalRepository.removeUser(id);

        return result && this._mapDBUserToUserOutputModel(result);
    },

    async deleteAll(): Promise<void> {
        await usersLocalRepository.removeAll();
    }
};
