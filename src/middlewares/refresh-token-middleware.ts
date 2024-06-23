import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../application/jwt-service';
import { CodeResponsesEnum } from '../types';
import { UsersService } from '../domain/users-service';
import { DevicesService } from '../domain/devices-service';
import { container } from '../features/composition-root';

const usersService = container.get(UsersService);
const devicesService = container.get(DevicesService);

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    const result = await jwtService.getResultByToken(token);

    if (typeof result === 'string' || !result?.userId || !result?.deviceId || !result?.lastActiveDate) {
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
        await devicesService.removeDevice(device.deviceId);

        res.send(CodeResponsesEnum.Unauthorized_401);

        return;
    }

    req.userId = result.userId;
    req.deviceId = result.deviceId;
    next();
};
