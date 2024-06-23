import { Router } from 'express';
import { body } from 'express-validator';
import { authorizationMiddleware } from '../middlewares/authorization-middleware';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { UsersController } from '../controllers/users-controller';
import { container } from '../features/composition-root';
import { UsersService } from '../domain/users-service';

const usersController = container.resolve(UsersController);
const usersService = container.get(UsersService);

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

usersRouter.get('/', authorizationMiddleware, usersController.getUsers.bind(usersController));
usersRouter.post('/',
    authorizationMiddleware,
    loginValidation,
    passwordValidation,
    emailValidation,
    inputValidationMiddleware,
    usersController.postUsers.bind(usersController)
);

usersRouter.delete('/:userId', authorizationMiddleware, usersController.deleteUser.bind(usersController));
