import { Request, Response } from 'express';
import { CodeResponsesEnum } from '../types';
import { UsersService } from '../domain/users-service';
import { jwtService } from '../application/jwt-service';
import { DevicesService } from '../domain/devices-service';
import { AuthService } from '../domain/auth-service';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthController {
    constructor(
        @inject(UsersService) protected usersService: UsersService,
        @inject(AuthService) protected authService: AuthService,
        @inject(DevicesService) protected devicesService: DevicesService
    ) {}

    async getMe(req: Request, res: Response) {
        const user = await this.usersService.getMeById(req.userId!);

        res.send(user);
    }

    async postLogin(req: Request, res: Response) {
        const user = await this.usersService.checkCredentials(req.body);

        if (!user) {
            res.send(CodeResponsesEnum.Unauthorized_401);
        } else {
            const ip = req.ip!;
            const title = req.headers['user-agent'] || 'device';
            const device = await this.devicesService.addDevice(user.id, ip, title);
            const accessToken = await jwtService.createJWT({ userId: user.id }, '10m');
            const refreshToken = await jwtService.createJWT(
                { userId: user.id, deviceId: device.deviceId, lastActiveDate: device.lastActiveDate },
                '20m'
            );

            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            res.send({ accessToken });
        }
    }

    async postRegistration(req: Request, res: Response) {
        await this.authService.addUser(req.body);

        res.send(CodeResponsesEnum.Not_content_204);
    }

    async postRegistrationConfirmation(req: Request, res: Response) {
        await this.authService.confirmEmail(req.body.code);

        res.send(CodeResponsesEnum.Not_content_204);
    }

    async postRegistrationEmailResending(req: Request, res: Response) {
        await this.authService.resendingEmail(req.body.email);

        res.send(CodeResponsesEnum.Not_content_204);
    }

    async postRefreshToken(req: Request, res: Response) {
        const updatedDevice = await this.devicesService.editDevice(req.deviceId!, req.ip!);
        const accessToken = await jwtService.createJWT({ userId: req.userId! }, '10m');
        const refreshToken = await jwtService.createJWT(
            { userId: req.userId!, deviceId: req.deviceId!, lastActiveDate: updatedDevice!.lastActiveDate },
            '20m'
        );

        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.send({ accessToken });
    }

    async postLogout(req: Request, res: Response) {
        await this.devicesService.removeDevice(req.deviceId!);

        res.send(CodeResponsesEnum.Not_content_204);
    }

    async postPasswordRecovery(req: Request, res: Response) {
        await this.authService.passwordRecovery(req.body.email);

        res.send(CodeResponsesEnum.Not_content_204);
    }

    async postNewPassword(req: Request, res: Response) {
        await this.authService.addNewPassword(req.body.recoveryCode, req.body.newPassword);

        res.send(CodeResponsesEnum.Not_content_204);
    }
}
