import express from 'express';
import cookieParser from 'cookie-parser';
import { readFile } from 'node:fs/promises';
import jwt from 'jsonwebtoken'
import path from 'path';
import { repoRoot } from './variables';

const JWT_COOKIE_NAME = 'JWT_TOKEN';

const JWT_OPTIONS = {
    expiresIn: 60 * 60 * 24 * 30 // 30 days
};

let privateKey: string;

export interface SessionData {
    username?: string;
    authenticated: boolean;
}

const DEFAULT_SESSION = {
    username: undefined,
    authenticated: false
}

export async function createSession(sessionData: SessionData = DEFAULT_SESSION): Promise<string> {
    if (!privateKey) {
        privateKey = await readFile(path.join(repoRoot, 'key.pem'), 'utf8');
    }

    return new Promise((res, rej) => {
        jwt.sign(sessionData, privateKey, JWT_OPTIONS, (err, token) => {
            if (err) {
                rej(err);
            } else {
                res(token as string);
            }
        });
    });
}

export const updateSession = (token: string, res: express.Response) => {
    res.setHeader('Set-Cookie', `${JWT_COOKIE_NAME}=${token};Max-Age=${JWT_OPTIONS.expiresIn};HttpOnly`);
}

export async function verifySession(token: string): Promise<SessionData> {
    if (!privateKey) {
        privateKey = await readFile(path.join(repoRoot, 'key.pem'), 'utf8');
    }

    return new Promise((res, rej) => {
        jwt.verify(token, privateKey, {}, (err, sessionData) => {
            if (err || !sessionData) {
                rej(err);
            } else {
                res(sessionData as SessionData);
            }
        });
    });
}

export function sessionMiddleware(): express.RequestHandler {
    return async (req, res, next) => {
        req.session = DEFAULT_SESSION;

        let tryCreateSession = true;

        if (req.cookies[JWT_COOKIE_NAME]) {
            console.log(`Reading session token ${req.cookies[JWT_COOKIE_NAME]}`);
            tryCreateSession = false;

            try {
               const sessionData = await verifySession(req.cookies.JWT_TOKEN);
               console.log(`Session parsed: ${JSON.stringify(sessionData)}`);
               req.session = sessionData;
            } catch(err) {
                if ((err as Error).name === 'TokenExpiredError') {
                    console.log('Token expired');
                    tryCreateSession = true;
                } else {
                    console.error(`Error parsing JWT: ${err}`);
                }
            }
        }

        if (tryCreateSession) {
            console.log('No token found or expired, creating new token');

            try {
                const sessionData = DEFAULT_SESSION;
                const token = await createSession(sessionData);
                req.session = sessionData;
                updateSession(token, res);
            } catch(err) {
                console.error(`Error creating JWT: ${err}`);
            }
        }

        next();
    }
}
