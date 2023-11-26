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
    const userId = await jwtService.getUserIdByToken(token);

    if (!userId) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const user = await usersService.getUserById(userId);

    if (!user) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    req.userId = userId;
    next();
};
