import nodemailer from 'nodemailer';

export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dimychdeveloper@gmail.com',
                pass: 'kpxjtwaczmbyxwwe'
            }
        });

        await transport.sendMail({
            from: 'Dimych <dimychdeveloper@gmail.com>',
            to: email,
            subject: subject,
            html: message
        });
    }
};
