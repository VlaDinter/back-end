import { Request, Response, NextFunction } from 'express';
import { CodeResponsesEnum } from '../types';

export const authorizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const encodedAdmin = Buffer.from('admin:qwerty').toString('base64');
    const isAuthorized = req.headers.authorization?.endsWith(encodedAdmin);

    if (!isAuthorized) {
        res.send(CodeResponsesEnum.Unauthorized_401);
    } else {
        next();
    }
};
