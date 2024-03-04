import { ParsedQs } from 'qs';
import bcrypt from 'bcrypt';
import { SortDirectionType } from '../types/SortDirectionType';
import { PaginationType } from '../types/PaginationType';
import { usersLocalRepository } from '../repositories/users-repository';
import { DBUserType } from '../types/DBUserType';
import { UserOutputType } from '../types/UserOutputType';
import { LoginOutputType } from '../types/LoginOutputType';
import { MeOutputType } from '../types/MeOutputType';
import { EmailConfirmationType } from '../types/EmailConfirmationType';

export const usersService = {
    async _generateHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt);

        return hash;
    },

    _mapDBUserToUserOutputModel(dbUser: DBUserType): DBUserType {
        return {
            id: dbUser.id,
            login: dbUser.login,
            email: dbUser.email,
            createdAt: dbUser.createdAt
        };
    },

    _mapDBUserToMeOutputModel(dbUser: DBUserType): MeOutputType {
        return {
            userId: dbUser.id,
            email: dbUser.email,
            login: dbUser.login,
        };
    },

    _mapDBUserToDBUserModel(dbUser: DBUserType): DBUserType {
        return {
            id: dbUser.id,
            login: dbUser.login,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            createdAt: dbUser.passwordHash,
            emailConfirmation: dbUser.emailConfirmation
        };
    },

    async getUsers(queryParams: ParsedQs): Promise<PaginationType<DBUserType>> {
        const filters = {
            searchLoginTerm: typeof queryParams.searchLoginTerm === 'string' ? queryParams.searchLoginTerm : null,
            searchEmailTerm: typeof queryParams.searchEmailTerm === 'string' ? queryParams.searchEmailTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionType.ASC ? SortDirectionType.ASC : SortDirectionType.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await usersLocalRepository.findUsers(filters);
        const postsCount = await usersLocalRepository.findUsersCount(filters);

        return {
            pagesCount: Math.ceil(postsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: postsCount,
            items: result.map(this._mapDBUserToUserOutputModel)
        };
    },

    async getUserById(id: string): Promise<DBUserType | null> {
        const result = await usersLocalRepository.findUserById(id);

        return result && this._mapDBUserToDBUserModel(result);
    },

    async getMeById(id: string): Promise<MeOutputType | null> {
        const result = await usersLocalRepository.findUserById(id);

        return result && this._mapDBUserToMeOutputModel(result);
    },

    async getUserByConfirmationCode(emailConfirmationCode: string): Promise<DBUserType | null> {
        const result = await usersLocalRepository.findUserByConfirmationCode(emailConfirmationCode);

        return result && this._mapDBUserToDBUserModel(result);
    },

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<DBUserType | null> {
        const result = await usersLocalRepository.findByLoginOrEmail(loginOrEmail);

        return result && this._mapDBUserToDBUserModel(result);
    },

    async setUser(newUser: UserOutputType, emailConfirmation?: EmailConfirmationType): Promise<DBUserType> {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(newUser.password, passwordSalt);
        const user = {
            id: `${+(new Date())}`,
            login: newUser.login,
            email: newUser.email,
            passwordHash,
            emailConfirmation
        };

        const result = await usersLocalRepository.createUser(user);

        return this._mapDBUserToUserOutputModel(result);
    },

    async checkCredentials(credentials: LoginOutputType): Promise<DBUserType | null> {
        const result = await this.getUserByLoginOrEmail(credentials.loginOrEmail);

        if (!result || !result.passwordHash) return null;

        const isConfirmed = !result.emailConfirmation || result.emailConfirmation.isConfirmed;

        if (!isConfirmed) return null;

        const checkedCredentials = await bcrypt.compare(credentials.password, result.passwordHash);

        if (!checkedCredentials) return null;

        return result && this._mapDBUserToUserOutputModel(result);
    },

    async editPassword(id: string, newPassword: string): Promise<void> {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(newPassword, passwordSalt);

        await usersLocalRepository.updatePassword(id, passwordHash);
    },

    async deleteUser(id: string): Promise<DBUserType | null> {
        const result = await usersLocalRepository.removeUser(id);

        return result && this._mapDBUserToUserOutputModel(result);
    },

    async deleteAll(): Promise<void> {
        await usersLocalRepository.removeAll();
    }
};
