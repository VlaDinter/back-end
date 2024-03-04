import { EmailConfirmationType } from './EmailConfirmationType';

export type DBUserType = {
    id: string,
    login: string,
    email: string,
    passwordHash?: string,
    createdAt?: string,
    emailConfirmation?: EmailConfirmationType
};
