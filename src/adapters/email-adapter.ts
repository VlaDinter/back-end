import nodemailer from 'nodemailer';
import { settings } from '../settings';

export const emailAdapter = {
    async sendEmail(email: string, title: string, message: string) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: settings.EMAIL_FROM,
                pass: settings.EMAIL_FROM_PASSWORD
            }
        });

        await transport.sendMail({
            from: 'Dimych <dimychdeveloper@gmail.com>',
            to: email,
            subject: title,
            html: message
        }, (error) => {
            console.log(error);
        });
    }
};
