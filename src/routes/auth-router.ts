import { Router } from 'express';
import { body } from 'express-validator';
import { inputValidationMiddleware } from '../middlewares/input-validation-middleware';
import { authMiddleware } from '../middlewares/auth-middleware';
import { loginValidation, emailValidation as userEmailValidation, passwordValidation as userPasswordValidation } from './users-router';
import { refreshTokenMiddleware } from '../middlewares/refresh-token-middleware';
import { requestsMiddleware } from '../middlewares/requests-middleware';
import { AuthController } from '../controllers/auth-controller';
import { UsersService } from '../domain/users-service';
import { container } from '../features/composition-root';

const authController = container.resolve(AuthController);
const usersService = container.resolve(UsersService);

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

authRouter.get('/me', authMiddleware, authController.getMe.bind(authController));
authRouter.post('/login',
    requestsMiddleware,
    loginOrEmailValidation,
    passwordValidation,
    inputValidationMiddleware,
    authController.postLogin.bind(authController)
);

authRouter.post('/registration',
    requestsMiddleware,
    loginValidation,
    userEmailValidation,
    userPasswordValidation,
    inputValidationMiddleware,
    authController.postRegistration.bind(authController)
);

authRouter.post('/registration-confirmation',
    requestsMiddleware,
    codeValidation,
    inputValidationMiddleware,
    authController.postRegistrationConfirmation.bind(authController)
);

authRouter.post('/registration-email-resending',
    requestsMiddleware,
    emailConfirmationValidation,
    inputValidationMiddleware,
    authController.postRegistrationEmailResending.bind(authController)
);

authRouter.post('/refresh-token', refreshTokenMiddleware, authController.postRefreshToken.bind(authController));
authRouter.post('/logout', refreshTokenMiddleware, authController.postLogout.bind(authController));
authRouter.post('/password-recovery',
    requestsMiddleware,
    emailValidation,
    inputValidationMiddleware,
    authController.postPasswordRecovery.bind(authController)
);

authRouter.post('/new-password',
    requestsMiddleware,
    newPasswordValidation,
    recoveryCodeValidation,
    inputValidationMiddleware,
    authController.postNewPassword.bind(authController)
);
