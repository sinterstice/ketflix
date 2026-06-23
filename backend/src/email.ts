import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    port: 587,
    host: "smtp.protonmail.ch",
    auth: {
        user: 'admin@kayfab.me',
        pass: process.env.SMTP_KEY,
    },
    secure: true, // upgrades later with STARTTLS -- change this based on the PORT
});

export const sendMail = async () => {
};
