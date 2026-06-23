import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { open } from 'sqlite';
import type { Database } from 'sqlite';
import path from 'path';
import { repoRoot } from './variables';

const SEVEN_DAYS_MS = 60 * 60 * 24 * 7 * 1000;

let database: Promise<Database<sqlite3.Database, sqlite3.Statement>> = open({
    filename: path.join(repoRoot, '/data/ketflix.db'),
    driver: sqlite3.cached.Database
})

export class Users {
    static async list() {
        const db = await database;
    }

    static async get(email: string) {
        const db = await database;

        return db.get("SELECT email, password, has_admin, data_limit FROM users WHERE email = ?", email);
    }

    static async updatePassword(email: string, password: string) {
        const db = await database;
        return await db.run(`UPDATE users SET password = ? WHERE email = ?`, password, email);
    }
}

export class Torrents {
    static async list() {
        const db = await database;
    }

    static async get(filename: string) {
        const db = await database;

    }

    static async getAllByUser(email: string) {
        const db = await database;

    }
}

export class Nonces {
    static async create(user: string, purpose: string, expires: Date = new Date(Date.now() + SEVEN_DAYS_MS)) {
        const db = await database;

        const hash = uuidv4();

        const result = await db.run(`INSERT INTO nonce(hash, user, purpose, consumed, expires) VALUES(?, ?, ?, FALSE, ?)`, hash, user, purpose, expires);

        return {
            result,
            hash
        }
    }

    static async get(hash: string, purpose: string) {
        const db = await database;

        return db.get(`SELECT user
          FROM nonce 
          WHERE 
              hash = ? AND 
              purpose = ? AND
              consumed = FALSE AND 
              expires > unixepoch('now')
          LIMIT 1
          `, hash, purpose);
    }

    static async consume(hash: string) {
        const db = await database;

        return db.run(`UPDATE nonce SET consumed = TRUE WHERE hash = ?`, hash);
    }
}

