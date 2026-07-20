import sql from './sql';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { repoRoot } from './variables';

const SEVEN_DAYS_MS = 60 * 60 * 24 * 7 * 1000;

interface UserSql {
    email: string;
    password: string;
    has_admin: boolean
    data_limit: number;
}


export class Users {
    static async list() {
        return  
    }

    static async get(email: string) {
        const result = await sql<UserSql[]>`SELECT email, password, has_admin, data_limit FROM users WHERE email = ${email}`;

        if (!result[0]) {
            throw new Error('User not found');
        }

        return result[0];
    }

    static async updatePassword(email: string, password: string) {
        return sql`UPDATE users SET password = ${password} WHERE email = ${email}`;
    }
}

export class Torrents {
    static async list() {
    }

    static async get(filename: string) {
    }

    static async getAllByUser(email: string) {
    }
}

interface NonceSql {
    hash: string;
    user: string;
    purpose: string;
    consumed: boolean;
    expires: Date;
}

export class Nonces {
    static async create(user: string, purpose: string, expires: Date = new Date(Date.now() + SEVEN_DAYS_MS)) {
        const hash = uuidv4();

        const result = await sql`INSERT INTO nonce(hash, user, purpose, consumed, expires) VALUES(${hash}, ${user}, ${purpose}, FALSE, ${expires}`;

        return {
            result,
            hash
        }
    }

    static async get(hash: string, purpose: string) {
        const result = await sql<NonceSql[]>`SELECT user
          FROM nonce 
          WHERE 
              hash = ${hash} AND 
              purpose = ${purpose} AND
              consumed = FALSE AND 
              expires > unixepoch('now')
          LIMIT 1`;

        return result[0];
    }

    static async consume(hash: string) {
        return sql`UPDATE nonce SET consumed = TRUE WHERE hash = ${hash}`;
    }
}
