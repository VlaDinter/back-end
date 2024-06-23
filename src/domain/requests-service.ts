import add from 'date-fns/add';
import { RequestsRepository } from '../repositories/requests-repository';
import { DBRequestType } from '../types/DBRequestType';
import { inject, injectable } from 'inversify';

@injectable()
export class RequestsService {
    constructor(
        @inject(RequestsRepository) protected requestsRepository: RequestsRepository
    ) {}

    _mapDBRequestToDBRequestModel(dbRequest: DBRequestType): DBRequestType {
        return {
            ip: dbRequest.ip,
            date: dbRequest.date,
            url: dbRequest.url
        };
    }

    async getRequests(ip: string, url: string): Promise<DBRequestType[]> {
        const date = add(new Date(), { seconds: -10 });
        const result = await this.requestsRepository.findRequests(ip, url, date);

        return result.map(this._mapDBRequestToDBRequestModel);
    }

    async addRequest(ip: string, url: string): Promise<DBRequestType> {
        const request = {
            ip,
            url,
            date: new Date()
        };

        const result = await this.requestsRepository.createRequest(request);

        return this._mapDBRequestToDBRequestModel(result);
    }

    async removeRequests(): Promise<void> {
        const date = add(new Date(), { seconds: -10 });

        await this.requestsRepository.deleteRequests(date);
    }

    async removeAll(): Promise<void> {
        await this.requestsRepository.deleteAll();
    }
}
