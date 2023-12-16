import { emailAdapter } from '../adapters/email-adapter';
import { DBUserModel } from '../models/DBUserModel';

export const emailManager = {
    async sendEmailConfirmationMessage(user: DBUserModel) {
        await emailAdapter.sendEmail(user.email, 'Email confirmation', `
            <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${user.emailConfirmation!.confirmationCode}'>complete registration</a>
            </p>
        `);
    }
};
