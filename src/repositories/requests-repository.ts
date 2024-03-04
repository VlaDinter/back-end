import { DBRequestType } from '../types/DBRequestType';
import { RequestModel } from '../models/request-model';

export const requestsLocalRepository = {
    async findRequests(ip: string, url: string, date: Date): Promise<DBRequestType[]> {
        return RequestModel.find({}, { _id: 0 }).and([{ ip }, { url }, { date: { $gte: date } }]).lean();
    },

    async createRequest(newRequest: DBRequestType): Promise<DBRequestType> {
        const requestInstance = new RequestModel();

        requestInstance.ip = newRequest.ip;
        requestInstance.url = newRequest.url;
        requestInstance.date = newRequest.date;

        await requestInstance.save();

        return requestInstance;
    },

    async removeRequests(date: Date): Promise<void> {
        await RequestModel.deleteMany({ date: { $lt: date } });
    },

    async removeAll(): Promise<void> {
        await RequestModel.deleteMany({});
    }
};
