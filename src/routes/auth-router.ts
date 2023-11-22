import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { usersService } from '../domain/users-service';

export const authRouter = Router({});

const loginOrEmailValidation = body('loginOrEmail').isString().withMessage('login or email is invalid').trim().notEmpty().withMessage('login or email is required');
const passwordValidation = body('password').isString().withMessage('password is invalid').trim().notEmpty().withMessage('password is required');

authRouter.post('/login',
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const checkedCredentials = await usersService.checkCredentials(req.body);

        if (!checkedCredentials) {
            res.send(CodeResponsesEnum.Unauthorized_401);
        } else {
            res.send(CodeResponsesEnum.Not_content_204);
        }
    }
);
