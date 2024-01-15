import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../application/jwt-service';
import { CodeResponsesEnum } from '../types';
import { usersService } from '../domain/users-service';
import { devicesService } from '../domain/devices-service';

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const result = await jwtService.getResultByToken(token);

    if (!result?.userId || !result?.deviceId || !result?.lastActiveDate) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const user = await usersService.getUserById(result.userId);
    const device = await devicesService.getDevice(result.deviceId);

    if (!user || !device || result.lastActiveDate !== device.lastActiveDate) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    if (+device.expirationDate < +(new Date)) {
        await devicesService.deleteDevice(device.deviceId);

        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    req.userId = result.userId;
    req.deviceId = result.deviceId;
    next();
};
