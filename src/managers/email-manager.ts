import { emailAdapter } from '../adapters/email-adapter';

export const emailManager = {
    async sendEmailConfirmationMessage(email: string, confirmationCode: string) {
        await emailAdapter.sendEmail(email, 'Email confirmation', `
            <h1>Thank for your registration</h1>
            <p>To finish registration please follow the link below:
                <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
            </p>
        `);
    },

    async sendPasswordRecoveryMessage(email: string, confirmationCode: string) {
        await emailAdapter.sendEmail(email, 'Password recovery', `
            <h1>Password recovery</h1>
            <p>To finish password recovery please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
            </p>
        `);
    }
};
