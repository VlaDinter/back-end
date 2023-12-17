import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserOutputModel } from '../models/UserOutputModel';
import { DBUserModel } from '../models/DBUserModel';
import { usersService } from './users-service';
import { usersLocalRepository } from '../repositories/users-repository';
import { emailManager } from '../managers/email-manager';

export const authService = {
    async setUser(newUser: UserOutputModel): Promise<DBUserModel> {
        const emailConfirmation = {
            confirmationCode: uuidv4(),
            isConfirmed: false,
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 30
            })
        };

        const createResult = await usersService.setUser(newUser, emailConfirmation);

        await emailManager.sendEmailConfirmationMessage({
            ...createResult,
            emailConfirmation
        });

        return createResult;
    },

    async confirmEmail(code: string): Promise<void> {
        const user = await usersService.getUserByConfirmationCode(code);

        await usersLocalRepository.updateConfirmation(user!.id);
    },

    async resendingEmail(email: string): Promise<void> {
        const user = await usersService.getUserByLoginOrEmail(email);

        user!.emailConfirmation!.confirmationCode = uuidv4();
        user!.emailConfirmation!.expirationDate = add(new Date(), {
            hours: 1,
            minutes: 30
        });

        await emailManager.resendingEmailConfirmationMessage(user!);
    }
};
