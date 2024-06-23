import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UserType } from '../types/UserType';
import { DBUserType } from '../types/DBUserType';
import { UsersService } from './users-service';
import { UsersRepository } from '../repositories/users-repository';
import { emailManager } from '../managers/email-manager';
import { inject, injectable } from 'inversify';

@injectable()
export class AuthService {
    constructor(
        @inject(UsersRepository) protected usersRepository: UsersRepository,
        @inject(UsersService) protected usersService: UsersService
    ) {}

    async addUser(newUser: UserType): Promise<DBUserType> {
        const emailConfirmation = {
            confirmationCode: uuidv4(),
            isConfirmed: false,
            expirationDate: add(new Date(), {
                hours: 1,
                minutes: 30
            })
        };

        const createResult = await this.usersService.addUser(newUser, emailConfirmation);

        await emailManager.sendEmailConfirmationMessage(createResult.email, emailConfirmation.confirmationCode);

        return createResult;
    }

    async confirmEmail(code: string): Promise<void> {
        const user = await this.usersService.getUserByConfirmationCode(code);

        await this.usersRepository.updateConfirmation(user!.id);
    }

    async resendingEmail(email: string): Promise<void> {
        const user = await this.usersService.getUserByLoginOrEmail(email);
        const confirmationCode = uuidv4();
        const expirationDate = add(new Date(), {
            hours: 1,
            minutes: 30
        });

        await emailManager.sendEmailConfirmationMessage(user!.email, confirmationCode);
        await this.usersRepository.updateEmailConfirmation(user!.id, confirmationCode, expirationDate);
    }

    async passwordRecovery(email: string): Promise<void> {
        const user = await this.usersService.getUserByLoginOrEmail(email);

        if (user) {
            const confirmationCode = uuidv4();
            const expirationDate = add(new Date(), {
                hours: 1,
                minutes: 30
            });

            await emailManager.sendPasswordRecoveryMessage(user.email, confirmationCode);
            await this.usersRepository.updateEmailConfirmation(user.id, confirmationCode, expirationDate);
        }
    }

    async addNewPassword(recoveryCode: string, newPassword: string): Promise<void> {
        const user = await this.usersService.getUserByConfirmationCode(recoveryCode);

        await this.usersService.editPassword(user!.id, newPassword);
    }
}
