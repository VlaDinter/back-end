import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { usersService } from '../domain/users-service';
import { jwtService } from '../application/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { loginValidation, emailValidation as userEmailValidation, passwordValidation as userPasswordValidation } from './users-router';
import { authService } from '../domain/auth-service';
import { refreshTokenMiddleware } from '../middlewares/refresh-token-middleware';
import { devicesService } from '../domain/devices-service';
import { requestsMiddleware } from '../middlewares/requests-middleware';

export const authRouter = Router({});

const loginOrEmailValidation = body('loginOrEmail').isString().withMessage('login or email is invalid').trim().notEmpty().withMessage('login or email is required');
const passwordValidation = body('password').isString().withMessage('password is invalid').trim().notEmpty().withMessage('password is required');
const newPasswordValidation = body('newPassword').isString().withMessage('new password is invalid').trim().notEmpty().withMessage('new password is required').isLength({ min: 6, max: 20 }).withMessage('new password is too long');
const emailValidation = body('email').isEmail().withMessage('email is invalid').trim().notEmpty().withMessage('email is required');
const codeValidation = body('code').isString().withMessage('code is invalid').trim().notEmpty().withMessage('code is required').custom(async code => {
    const user = await usersService.getUserByConfirmationCode(code);

    if (!user?.emailConfirmation) throw new Error('code is incorrect');
    if (user.emailConfirmation.isConfirmed) throw new Error('code is already been applied');
    if (user.emailConfirmation.expirationDate < new Date()) throw new Error('code is expired');

    return true;
});

const recoveryCodeValidation = body('recoveryCode').isString().withMessage('recovery code is invalid').trim().notEmpty().withMessage('recovery code is required').custom(async recoveryCode => {
    const user = await usersService.getUserByConfirmationCode(recoveryCode);

    if (!user?.emailConfirmation) throw new Error('recovery code is incorrect');
    if (user.emailConfirmation.expirationDate < new Date()) throw new Error('recovery code is expired');

    return true;
});

const emailConfirmationValidation = body('email').isEmail().withMessage('email is invalid').trim().notEmpty().withMessage('email is required').custom(async email => {
    const user = await usersService.getUserByLoginOrEmail(email);

    if (!user?.emailConfirmation) throw new Error('email is incorrect');
    if (user.emailConfirmation.isConfirmed) throw new Error('email is already confirmed');

    return true;
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
    const user = await usersService.getMeById(req.userId!);

    res.send(user);
});

authRouter.post('/login',
    requestsMiddleware,
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const user = await usersService.checkCredentials(req.body);

        if (!user) {
            res.send(CodeResponsesEnum.Unauthorized_401);
        } else {
            const ip = req.ip!;
            const title = req.headers['user-agent'] || 'device';
            const device = await devicesService.setDevice(user.id, ip, title);
            const accessToken = await jwtService.createJWT({ userId: user.id }, '10s');
            const refreshToken = await jwtService.createJWT(
                { userId: user.id, deviceId: device.deviceId, lastActiveDate: device.lastActiveDate },
                '20s'
            );

            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            res.send({ accessToken });
        }
    }
);

authRouter.post('/registration',
    requestsMiddleware,
    loginValidation,
    userEmailValidation,
    userPasswordValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.setUser(req.body);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);

authRouter.post('/registration-confirmation',
    requestsMiddleware,
    codeValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.confirmEmail(req.body.code);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);

authRouter.post('/registration-email-resending',
    requestsMiddleware,
    emailConfirmationValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.resendingEmail(req.body.email);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);

authRouter.post('/refresh-token', refreshTokenMiddleware, async (req: Request, res: Response) => {
    const updatedDevice = await devicesService.editDevice(req.deviceId!, req.ip!);
    const accessToken = await jwtService.createJWT({ userId: req.userId! }, '10s');
    const refreshToken = await jwtService.createJWT(
        { userId: req.userId!, deviceId: req.deviceId!, lastActiveDate: updatedDevice!.lastActiveDate },
        '20s'
    );

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    res.send({ accessToken });
});

authRouter.post('/logout', refreshTokenMiddleware, async (req: Request, res: Response) => {
    await devicesService.deleteDevice(req.deviceId!);

    res.send(CodeResponsesEnum.Not_content_204);
});

authRouter.post('/password-recovery',
    requestsMiddleware,
    emailValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.passwordRecovery(req.body.email);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);

authRouter.post('/new-password',
    requestsMiddleware,
    newPasswordValidation,
    recoveryCodeValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.setNewPassword(req.body.recoveryCode, req.body.newPassword);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);
