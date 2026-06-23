import { Router } from 'express';
import type Express from 'express';
import argon2 from 'argon2';
import { createSession, updateSession } from '../session';
import { Users, Nonces } from '../database';
import { baseUrl } from '../variables';
import { sendMail } from '../email';
import { assert, catchAsync } from '../util';

export const api = Router();

api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

api.post('/login', catchAsync(async (req, res) => {
    if (typeof req.body.email !== 'string' ||
        req.body.email.length < 1 ||
        typeof req.body.password !== 'string' || 
        req.body.password.length < 1) {

        return res.status(400).json({ error: 'Invalid request' });
    }

    const { email, password } = req.body;

    const user = await Users.get(email);

    if (!user) {
        return res.status(401).json({ error: 'No such user' });
    }
    
    const { password: hashedPassword } = user;

    if (!hashedPassword) {
        // TODO: DOS attack possible here
        const { hash } = await Nonces.create(email, 'password_reset');

        sendMail({ 
            email, 
            subject: 'Ketflix: reset your password', 
            body: `Reset password here: ${baseUrl}?passwordReset=${hash}`
        });

        // Password reset is required
        return res.status(400).json({ error: 'User requires password reset, sending secret link to email' });
    }

    if (!await argon2.verify(hashedPassword, password)) {
        return res.status(401).json({ error: 'Passwords do not match' });
    }

    const token = await createSession({ email, authenticated: true });
    updateSession(token, res);

    return res.status(200).json({ email });
}));

api.get('/session', catchAsync((req, res) => {
    if (!req.session) {
        return res.status(200).json({ authenticated: false });
    }

    const { email, authenticated = false } = req.session;

    return res.status(200).json({
        authenticated,
        email
    });
}));

api.post('/create-password-reset', catchAsync(async (req, res) => {
    const { email } = req.body;

    const user = await Users.get(email);

    if (!user) {
        return res.status(401).json({ error: 'No such user' });
    }

    // TODO: DOS attack possible here
    const { hash } = await Nonces.create(email, 'password_reset');

    sendMail({ 
        email, 
        subject: 'Ketflix: reset your password', 
        body: `Reset password here: ${baseUrl}?passwordReset=${hash}`
    });

    return res.json({ ok: true });
}));

api.post('/reset-password', catchAsync(async (req, res) => {
    const { password: newPassword, nonce } = req.body;

    if (!nonce || !newPassword) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const result = await Nonces.get(nonce, 'password_reset');

    if (!result) {
        return res.status(400).json({ error: 'Invalid or expired nonce' });
    }

    const email = result.user;

    await Nonces.consume(nonce);
    const hashedPassword = await argon2.hash(newPassword);
    await Users.updatePassword(email, hashedPassword);

    return res.json({ ok: true, email });
}));

const checkAuthenticated = async (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (!req.session?.authenticated) {
        return res.status(401).json({ error: 'Requires authentication' });
    }

    next();
}

api.get('/self', checkAuthenticated, async (req, res) => {
    const email = req.session?.email;
    assert(typeof email === 'string');

    const { has_admin, data_limit } = await Users.get(email);

    return res.json({ 
        email,
        hasAdmin: has_admin,
        dataLimit: data_limit
    });
});

api.all('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});
