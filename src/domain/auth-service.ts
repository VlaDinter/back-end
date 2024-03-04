import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserOutputType } from '../types/UserOutputType';
import { DBUserType } from '../types/DBUserType';
import { usersService } from './users-service';
import { usersLocalRepository } from '../repositories/users-repository';
import { emailManager } from '../managers/email-manager';

export const authService = {
    async setUser(newUser: UserOutputType): Promise<DBUserType> {
        const emailConfirmation = {
            confirmationCode: uuidv4(),
            isConfirmed: false,
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 30
            })
        };

        const createResult = await usersService.setUser(newUser, emailConfirmation);

        await emailManager.sendEmailConfirmationMessage(createResult.email, emailConfirmation.confirmationCode);

        return createResult;
    },

    async confirmEmail(code: string): Promise<void> {
        const user = await usersService.getUserByConfirmationCode(code);

        await usersLocalRepository.updateConfirmation(user!.id);
    },

    async resendingEmail(email: string): Promise<void> {
        const user = await usersService.getUserByLoginOrEmail(email);
        const confirmationCode = uuidv4();
        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 30
        });

        await emailManager.sendEmailConfirmationMessage(user!.email, confirmationCode);
        await usersLocalRepository.updateEmailConfirmation(user!.id, confirmationCode, expirationDate);
    },

    async passwordRecovery(email: string): Promise<void> {
        const user = await usersService.getUserByLoginOrEmail(email);

        if (user) {
            const confirmationCode = uuidv4();
            const expirationDate = add(new Date(), {
                hours: 1,
                minutes: 30
            });

            await emailManager.sendEmailConfirmationMessage(user.email, confirmationCode);
            await usersLocalRepository.updateEmailConfirmation(user.id, confirmationCode, expirationDate);
        }
    },

    async setNewPassword(recoveryCode: string, newPassword: string): Promise<void> {
        const user = await usersService.getUserByConfirmationCode(recoveryCode);

        await usersService.editPassword(user!.id, newPassword);
    }
};
