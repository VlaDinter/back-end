import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { CodeResponsesEnum } from '../types';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { usersService } from '../domain/users-service';

export const usersRouter = Router({});

export const passwordValidation = body('password').isString().withMessage('password is invalid').trim().notEmpty().withMessage('password is required').isLength({ min: 6, max: 20 }).withMessage('password is too long');
export const loginValidation = body('login').isString().withMessage('login is invalid').trim().notEmpty().withMessage('login is required').isLength({ min: 3, max: 10 }).withMessage('login is too long').custom(async login => {
    const user = await usersService.getUserByLoginOrEmail(login);

    if (user) throw new Error('login is already exist');

    return true;
});

export const emailValidation = body('email').isEmail().withMessage('email is invalid').trim().notEmpty().withMessage('email is required').custom(async email => {
    const user = await usersService.getUserByLoginOrEmail(email);

    if (user) throw new Error('email is already exist');

    return true;
});

usersRouter.get('/', authorizationMiddleware, async (req: Request, res: Response) => {
    const foundUsers = await usersService.getUsers(req.query);

    res.send(foundUsers);
});

usersRouter.post('/',
    authorizationMiddleware,
    loginValidation,
    passwordValidation,
    emailValidation,
    inputValidationMiddleware,
    async (req: Request, res: Response) => {
        const createdUser = await usersService.setUser(req.body);

        res.status(CodeResponsesEnum.Created_201).send(createdUser);
    }
);

usersRouter.delete('/:userId', authorizationMiddleware, async (req: Request, res: Response) => {
    const deletedUser = await usersService.deleteUser(req.params.userId);

    if (!deletedUser) {
        res.send(CodeResponsesEnum.Not_found_404);
    } else {
        res.send(CodeResponsesEnum.Not_content_204);
    }
});
