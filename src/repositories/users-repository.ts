import { usersCollection } from '../db/db';
import { FiltersModel } from '../models/FiltersModel';
import { Filter } from 'mongodb';
import { DBUserModel } from '../models/DBUserModel';

export const usersLocalRepository = {
    getUsersFilter(filters: FiltersModel): Filter<DBUserModel> {
        let filter: Filter<DBUserModel> = {};

        if (filters.searchLoginTerm && filters.searchEmailTerm) {
            filter.$or = [{ login: { $regex: filters.searchLoginTerm, $options: 'i' } }, { email: { $regex: filters.searchEmailTerm, $options: 'i' } }];
        } else if (filters.searchLoginTerm) {
            filter.login = { $regex: filters.searchLoginTerm, $options: 'i' };
        } else if (filters.searchEmailTerm) {
            filter.email = { $regex: filters.searchEmailTerm, $options: 'i' };
        }

        return filter;
    },

    async getUsersCount(filters: FiltersModel): Promise<number> {
        const filter = this.getUsersFilter(filters);

        return await usersCollection.find(filter).count();
    },

    async findUsers(filters: FiltersModel): Promise<DBUserModel[]> {
        const skip = (filters.pageNumber - 1) * filters.pageSize;
        const sort = { [filters.sortBy]: filters.sortDirection };
        const filter = this.getUsersFilter(filters);

        return await usersCollection.find(filter).sort(sort).skip(skip).limit(filters.pageSize).toArray();
    },

    async findUserByConfirmationCode(emailConfirmationCode: string): Promise<DBUserModel | null> {
        return await usersCollection.findOne({ ['emailConfirmation.confirmationCode']: emailConfirmationCode });
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<DBUserModel | null> {
        return await usersCollection.findOne({ $or: [{ email: loginOrEmail }, { login: loginOrEmail }] });
    },

    async findUserById(id: string): Promise<DBUserModel | null> {
        return await usersCollection.findOne({ id });
    },

    async createUser(newUser: DBUserModel): Promise<DBUserModel> {
        const result = await usersCollection.insertOne(newUser);

        return newUser;
    },

    async updateConfirmation(id: string): Promise<void> {
        await usersCollection.updateOne({ id }, { $set: { 'emailConfirmation.isConfirmed': true } });
    },

    async updateEmailConfirmation(id: string, confirmationCode: string, expirationDate: Date): Promise<void> {
        await usersCollection.updateOne({ id }, { $set: { 'emailConfirmation.confirmationCode': confirmationCode, 'emailConfirmation.expirationDate': expirationDate } });
    },

    async updateRefreshTokens(id: string, refreshToken: string): Promise<void> {
        await usersCollection.updateOne({ id }, { $push: { refreshTokens: refreshToken } });
    },

    async removeUser(id: string): Promise<DBUserModel | null> {
        return await usersCollection.findOneAndDelete({ id });
    },

    async removeAll(): Promise<void> {
        await usersCollection.deleteMany({});
    }
};
