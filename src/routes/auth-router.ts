import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { usersService } from '../domain/users-service';
import { jwtService } from '../application/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';
import { emailValidation as userEmailValidation, loginValidation, passwordValidation as userPasswordValidation } from './users-router';
import { authService } from '../domain/auth-service';

export const authRouter = Router({});

const loginOrEmailValidation = body('loginOrEmail').isString().withMessage('login or email is invalid').trim().notEmpty().withMessage('login or email is required');
const passwordValidation = body('password').isString().withMessage('password is invalid').trim().notEmpty().withMessage('password is required');
const codeValidation = body('code').isString().withMessage('code is invalid').trim().notEmpty().withMessage('code is required').custom(async code => {
    const user = await usersService.getUserByConfirmationCode(code);

    if (!user) throw new Error('code is incorrect');
    if (user.emailConfirmation!.isConfirmed) throw new Error('code is already been applied');
    if (user.emailConfirmation!.expirationDate < new Date()) throw new Error('code is expired');

    return true;
});

const emailValidation = body('email').isEmail().withMessage('email is invalid').trim().notEmpty().withMessage('email is required').custom(async email => {
    const user = await usersService.getUserByLoginOrEmail(email);

    if (!user) throw new Error('email is incorrect');
    if (user.emailConfirmation!.isConfirmed) throw new Error('email is already confirmed');

    return true;
});

authRouter.get('/me',
    authMiddleware,
    async (req: Request, res: Response) => {
        const user = await usersService.getUserById(req.userId as string);

        res.send(user);
    }
);

authRouter.post('/login',
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const user = await usersService.checkCredentials(req.body);

        if (!user) {
            res.send(CodeResponsesEnum.Unauthorized_401);
        } else {
            const token = await jwtService.createJWT(user);

            res.send({ accessToken: token });
        }
    }
);

authRouter.post('/registration',
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
    codeValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.confirmEmail(req.body.code);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);

authRouter.post('/registration-email-resending',
    emailValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        await authService.resendingEmail(req.body.email);

        res.send(CodeResponsesEnum.Not_content_204);
    }
);
