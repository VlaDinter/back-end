import { emailManager } from '../managers/email-manager';
import { DBUserModel } from '../models/DBUserModel';

export const businessService = {
    async doOperation(user: DBUserModel): Promise<void> {
        await emailManager.sendEmailConfirmationMessage(user);
    }
};
