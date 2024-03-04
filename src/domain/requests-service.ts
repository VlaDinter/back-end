import add from 'date-fns/add';
import { requestsLocalRepository } from '../repositories/requests-repository';
import { DBRequestType } from '../types/DBRequestType';

export const requestsService = {
    _mapDBRequestToDBRequestModel(dbRequest: DBRequestType): DBRequestType {
        return {
            ip: dbRequest.ip,
            date: dbRequest.date,
            url: dbRequest.url
        };
    },

    async getRequests(ip: string, url: string): Promise<DBRequestType[]> {
        const date = add(new Date(), { seconds: -10 });
        const result = await requestsLocalRepository.findRequests(ip, url, date);

        return result.map(this._mapDBRequestToDBRequestModel);
    },

    async setRequest(ip: string, url: string): Promise<DBRequestType> {
        const request = {
            ip,
            url,
            date: new Date()
        };

        const result = await requestsLocalRepository.createRequest(request);

        return this._mapDBRequestToDBRequestModel(result);
    },

    async deleteRequests(): Promise<void> {
        const date = add(new Date(), { seconds: -10 });

        await requestsLocalRepository.removeRequests(date);
    },

    async deleteAll(): Promise<void> {
        await requestsLocalRepository.removeAll();
    }
};
