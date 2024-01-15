import { requestsCollection } from '../db/db';
import { DBRequestModel } from '../models/DBRequestModel';

export const requestsLocalRepository = {
    async findRequests(ip: string, url: string, date: Date): Promise<DBRequestModel[]> {
        return await requestsCollection.find({ $and: [{ ip }, { url }, { date: { $gte: date } }] }).toArray();
    },

    async createRequest(newRequest: DBRequestModel): Promise<DBRequestModel> {
        const result = await requestsCollection.insertOne(newRequest);

        return newRequest;
    },

    async removeRequests(date: Date): Promise<void> {
        await requestsCollection.deleteMany({ date: { $lt: date } });
    },

    async removeAll(): Promise<void> {
        await requestsCollection.deleteMany({});
    }
};
