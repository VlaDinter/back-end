import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { usersService } from '../domain/users-service';
import { jwtService } from '../application/jwt-service';
import { authMiddleware } from '../middlewares/auth-middleware';

export const authRouter = Router({});

const loginOrEmailValidation = body('loginOrEmail').isString().withMessage('login or email is invalid').trim().notEmpty().withMessage('login or email is required');
const passwordValidation = body('password').isString().withMessage('password is invalid').trim().notEmpty().withMessage('password is required');

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
