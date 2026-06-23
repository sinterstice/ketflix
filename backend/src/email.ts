import nodemailer from 'nodemailer';

export const EMAIL = 'admin@kayfab.me';

const transport = nodemailer.createTransport({
    port: 587,
    host: "smtp.protonmail.ch",
    auth: {
        user: EMAIL,
        pass: process.env.SMTP_KEY,
    },
    tls: {
        ciphers:'SSLv3'
    }
});

export interface MailOptions {
    email: string;
    subject: string;
    body: string;
}

export const sendMail = async (options: MailOptions) => {
    console.log('Sending email', options.email, options.subject);
    return new Promise((res, rej) => {
        transport.sendMail({
            from: EMAIL,
            to: options.email,
            subject: options.subject,
            text: options.body
        }, (error, info) => {
            if (error) {
                rej(error);
            } else {
                res(info)
            }
        });
    });
};
