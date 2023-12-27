import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../application/jwt-service';
import { CodeResponsesEnum } from '../types';
import { usersService } from '../domain/users-service';

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const userId = await jwtService.getUserIdByToken(token);

    if (!userId) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const user = await usersService.getUserById(userId);

    if (!user || user.refreshTokens!.includes(token)) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    req.userId = userId;
    next();
};
