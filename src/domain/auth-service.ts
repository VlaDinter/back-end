import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserOutputModel } from '../models/UserOutputModel';
import { DBUserModel } from '../models/DBUserModel';
import { usersService } from './users-service';
import { usersLocalRepository } from '../repositories/users-repository';
import { businessService } from './business-service';

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

        await businessService.doOperation({
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

        await businessService.doOperation(user!);
        await usersLocalRepository.updateEmailConfirmation(user!.id, uuidv4(), add(new Date(), {
            hours: 1,
            minutes: 30
        }));
    }
};
