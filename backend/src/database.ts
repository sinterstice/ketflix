import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import type { Database } from 'sqlite';
import path from 'path';
import { repoRoot } from './variables';

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

        return db.get('SELECT email, password, has_admin, data_limit FROM users WHERE email = ?', email);
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


