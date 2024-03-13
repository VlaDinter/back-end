import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../application/jwt-service';
import { usersService } from '../domain/users-service';

export const userIdMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const result = await jwtService.getResultByToken(token);

        if (result?.userId) {
            const user = await usersService.getUserById(result.userId);

            if (user) {
                req.userId = result.userId;
            }
        }
    }

    next();
};
