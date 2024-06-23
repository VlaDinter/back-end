import { Request, Response, NextFunction } from 'express';
import { CodeResponsesEnum } from '../types';
import { RequestsService } from '../domain/requests-service';
import { container } from '../features/composition-root';

const requestsService = container.get(RequestsService);

export const requestsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip!;
    const url = req.originalUrl;
    const requests = await requestsService.getRequests(ip, url);

    await requestsService.addRequest(ip, url);
    await requestsService.removeRequests();

    if (requests.length >= 5) {
        res.send(CodeResponsesEnum.Too_many_requests_429);
    } else {
        next();
    }
};
