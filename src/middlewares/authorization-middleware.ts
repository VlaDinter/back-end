import { Request, Response, NextFunction } from 'express';
import { CodeResponsesEnum } from '../types';

export const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;
    const isAuthorized = req.headers.authorization === authorization;

    if (!isAuthorized) {
        res.send(CodeResponsesEnum.Unauthorized_401);
    } else {
        next();
    }
};
