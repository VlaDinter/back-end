import { EmailConfirmationModel } from './EmailConfirmationModel';

export type DBUserModel = {
    id: string,
    login: string,
    email: string,
    passwordSalt?: string,
    passwordHash?: string,
    createdAt?: string,
    emailConfirmation?: EmailConfirmationModel
};
