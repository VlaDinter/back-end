import { ParsedQs } from 'qs';
import bcrypt from 'bcrypt';
import { SortDirectionEnum } from '../types/SortDirectionEnum';
import { PaginationType } from '../types/PaginationType';
import { UsersRepository } from '../repositories/users-repository';
import { DBUserType } from '../types/DBUserType';
import { UserType } from '../types/UserType';
import { LoginType } from '../types/LoginType';
import { MeType } from '../types/MeType';
import { EmailConfirmationType } from '../types/EmailConfirmationType';
import { inject, injectable } from 'inversify';

@injectable()
export class UsersService {
    constructor(
        @inject(UsersRepository) protected usersRepository: UsersRepository
    ) {}

    async _generateHash(password: string, salt: string): Promise<string> {
        const hash = await bcrypt.hash(password, salt);

        return hash;
    }

    async _isPasswordCorrect(password: string, hash: string): Promise<boolean> {
        const isEqual = await bcrypt.compare(password, hash);

        return isEqual;
    }

    _mapDBUserToUserOutputModel(dbUser: DBUserType): DBUserType {
        return {
            id: dbUser.id,
            login: dbUser.login,
            email: dbUser.email,
            createdAt: dbUser.createdAt
        };
    }

    _mapDBUserToMeOutputModel(dbUser: DBUserType): MeType {
        return {
            userId: dbUser.id,
            email: dbUser.email,
            login: dbUser.login,
        };
    }

    _mapDBUserToDBUserModel(dbUser: DBUserType): DBUserType {
        return {
            id: dbUser.id,
            login: dbUser.login,
            email: dbUser.email,
            passwordHash: dbUser.passwordHash,
            createdAt: dbUser.passwordHash,
            emailConfirmation: dbUser.emailConfirmation
        };
    }

    async getUsers(queryParams: ParsedQs): Promise<PaginationType<DBUserType>> {
        const filters = {
            searchLoginTerm: typeof queryParams.searchLoginTerm === 'string' ? queryParams.searchLoginTerm : null,
            searchEmailTerm: typeof queryParams.searchEmailTerm === 'string' ? queryParams.searchEmailTerm : null,
            sortBy: typeof queryParams.sortBy === 'string' ? queryParams.sortBy : 'createdAt',
            sortDirection: queryParams.sortDirection === SortDirectionEnum.ASC ? SortDirectionEnum.ASC : SortDirectionEnum.DESC,
            pageNumber: !isNaN(Number(queryParams.pageNumber)) ? Number(queryParams.pageNumber) : 1,
            pageSize: !isNaN(Number(queryParams.pageSize)) ? Number(queryParams.pageSize) : 10
        };

        const result = await this.usersRepository.findUsers(filters);
        const postsCount = await this.usersRepository.findUsersCount(filters);

        return {
            pagesCount: Math.ceil(postsCount / filters.pageSize),
            page: filters.pageNumber,
            pageSize: filters.pageSize,
            totalCount: postsCount,
            items: result.map(this._mapDBUserToUserOutputModel)
        };
    }

    async getUserById(id: string): Promise<DBUserType | null> {
        const result = await this.usersRepository.findUserById(id);

        return result && this._mapDBUserToDBUserModel(result);
    }

    async getMeById(id: string): Promise<MeType | null> {
        const result = await this.usersRepository.findUserById(id);

        return result && this._mapDBUserToMeOutputModel(result);
    }

    async getUserByConfirmationCode(emailConfirmationCode: string): Promise<DBUserType | null> {
        const result = await this.usersRepository.findUserByConfirmationCode(emailConfirmationCode);

        return result && this._mapDBUserToDBUserModel(result);
    }

    async getUserByLoginOrEmail(loginOrEmail: string): Promise<DBUserType | null> {
        const result = await this.usersRepository.findByLoginOrEmail(loginOrEmail);

        return result && this._mapDBUserToDBUserModel(result);
    }

    async addUser(newUser: UserType, emailConfirmation?: EmailConfirmationType): Promise<DBUserType> {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(newUser.password, passwordSalt);
        const user = {
            id: `${+(new Date())}`,
            login: newUser.login,
            email: newUser.email,
            passwordHash,
            emailConfirmation
        };

        const result = await this.usersRepository.createUser(user);

        return this._mapDBUserToUserOutputModel(result);
    }

    async checkCredentials(credentials: LoginType): Promise<DBUserType | null> {
        const result = await this.getUserByLoginOrEmail(credentials.loginOrEmail);

        if (!result || !result.passwordHash) return null;

        const isConfirmed = !result.emailConfirmation || result.emailConfirmation.isConfirmed;

        if (!isConfirmed) return null;

        const checkedCredentials = await this._isPasswordCorrect(credentials.password, result.passwordHash);

        if (!checkedCredentials) return null;

        return result && this._mapDBUserToUserOutputModel(result);
    }

    async editPassword(id: string, newPassword: string): Promise<void> {
        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await this._generateHash(newPassword, passwordSalt);

        await this.usersRepository.updatePassword(id, passwordHash);
    }

    async removeUser(id: string): Promise<DBUserType | null> {
        const result = await this.usersRepository.deleteUser(id);

        return result && this._mapDBUserToUserOutputModel(result);
    }

    async removeAll(): Promise<void> {
        await this.usersRepository.deleteAll();
    }
}
