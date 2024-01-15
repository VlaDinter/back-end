import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../application/jwt-service';
import { CodeResponsesEnum } from '../types';
import { usersService } from '../domain/users-service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const token = req.headers.authorization.split(' ')[1];
    const result = await jwtService.getResultByToken(token);

    if (!result?.userId) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const user = await usersService.getUserById(result.userId);

    if (!user) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    req.userId = result.userId;
    next();
};
