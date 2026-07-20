import postgres from 'postgres';

const sql = postgres({
    database: 'ketflix',
    user: 'ketflix',
    password: process.env.POSTGRES_PASSWORD
});

export default sql;
