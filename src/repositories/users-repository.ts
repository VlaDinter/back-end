import { Query } from 'mongoose';
import { FiltersType } from '../types/FiltersType';
import { DBUserType } from '../types/DBUserType';
import { UserModel } from '../models/user-model';
import { injectable } from 'inversify';

@injectable()
export class UsersRepository {
    findUsersQuery(filters: FiltersType): Query<DBUserType[], DBUserType> {
        const query = UserModel.find({}, { _id: 0 });

        if (filters.searchLoginTerm && filters.searchEmailTerm) {
            query.or([{ login: { $regex: filters.searchLoginTerm, $options: 'i' } }, { bio: { $regex: filters.searchEmailTerm, $options: 'i' } }]);
        } else if (filters.searchLoginTerm) {
            query.where('login').regex(new RegExp(filters.searchLoginTerm, 'i'));
        } else if (filters.searchEmailTerm) {
            query.where('email').regex(new RegExp(filters.searchEmailTerm, 'i'));
        }

        return query;
    }

    async findUsersCount(filters: FiltersType): Promise<number> {
        return this.findUsersQuery(filters).countDocuments().lean();
    }

    async findUsers(filters: FiltersType): Promise<DBUserType[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };

        return this.findUsersQuery(filters).sort(sort).skip(skip).limit(filters.pageSize).lean();
    }

    async findUserByConfirmationCode(emailConfirmationCode: string): Promise<DBUserType | null> {
        return UserModel.findOne({ 'emailConfirmation.confirmationCode': emailConfirmationCode }, { _id: 0 }).lean();
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<DBUserType | null> {
        return UserModel.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] }, { _id: 0 }).lean();
    }

    async findUserById(id: string): Promise<DBUserType | null> {
        return UserModel.findOne({ id }, { _id: 0 }).lean();
    }

    async createUser(newUser: DBUserType): Promise<DBUserType> {
        const userInstance = new UserModel();

        userInstance.id = newUser.id;
        userInstance.login = newUser.login;
        userInstance.email = newUser.email;
        userInstance.passwordHash = newUser.passwordHash;
        userInstance.emailConfirmation = newUser.emailConfirmation;

        await userInstance.save();

        return userInstance;
    }

    async updateConfirmation(id: string): Promise<void> {
        const userInstance = await UserModel.findOne({ id });

        if (userInstance?.emailConfirmation) {
            userInstance.emailConfirmation.isConfirmed = true;

            await userInstance.save();
        }
    }

    async updateEmailConfirmation(id: string, confirmationCode: string, expirationDate: Date): Promise<void> {
        const userInstance = await UserModel.findOne({ id });

        if (userInstance?.emailConfirmation) {
            userInstance.emailConfirmation.confirmationCode = confirmationCode;
            userInstance.emailConfirmation.expirationDate = expirationDate;

            await userInstance.save();
        }

        if (userInstance && !userInstance.emailConfirmation) {
            userInstance.emailConfirmation = {
                confirmationCode: confirmationCode,
                expirationDate: expirationDate,
                isConfirmed: true
            };

            await userInstance.save();
        }
    }

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        const userInstance = await UserModel.findOne({ id });

        if (userInstance) {
            userInstance.passwordHash = passwordHash;

            await userInstance.save();
        }
    }

    async deleteUser(id: string): Promise<DBUserType | null> {
        const userInstance = await UserModel.findOne({ id });

        if (!userInstance) return null;

        await userInstance.deleteOne();

        return userInstance;
    }

    async deleteAll(): Promise<void> {
        await UserModel.deleteMany({});
    }
}
