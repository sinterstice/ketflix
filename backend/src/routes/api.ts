import { Router } from 'express';
import argon2 from 'argon2';
import { createSession, updateSession } from '../session';
import { Users } from '../database';

export const api = Router();

api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

api.post('/login', async (req, res) => {
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

    if (!await argon2.verify(hashedPassword, password)) {
        return res.status(401).json({ error: 'Passwords do not match' });
    }

    const token = await createSession({ email, authenticated: true });
    updateSession(token, res);

    return res.status(200).json({ email });
});

api.get('/session', (req, res) => {
    if (!req.session) {
        return res.status(200).json({ authenticated: false });
    }

    const { email, authenticated = false } = req.session;

    return res.status(200).json({
        authenticated,
        email
    });
});

api.all('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});
