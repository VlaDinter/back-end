import { Request, Response, NextFunction } from 'express';
import { CodeResponsesEnum } from '../types';
import { requestsService } from '../domain/requests-service';

export const requestsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip!;
    const url = req.originalUrl;
    const requests = await requestsService.getRequests(ip, url);

    await requestsService.setRequest(ip, url);
    await requestsService.deleteRequests();

    if (requests.length >= 5) {
        res.send(CodeResponsesEnum.Too_many_requests_429);
    } else {
        next();
    }
};
