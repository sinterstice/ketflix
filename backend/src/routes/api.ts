import { Router } from 'express';
import { sessionMiddleware, createSession, updateSession } from '../session';

export const api = Router();

api.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

api.post('/login', async (req, res) => {
    if (typeof req.body.username !== 'string' ||
        req.body.username.length < 1 ||
        typeof req.body.password !== 'string' || 
        req.body.password.length < 1) {

        return res.status(400).json({ error: 'Invalid request' });
    }

    const { username } = req.body;

    const token = await createSession({ username, authenticated: true });
    updateSession(token, res);

    return res.status(200).json({ username });
});

api.get('/session', (req, res) => {
    if (!req.session) {
        return res.status(200).json({ authenticated: false });
    }

    const { username, authenticated = false } = req.session;

    return res.status(200).json({
        authenticated,
        username
    });
});

api.all('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});
