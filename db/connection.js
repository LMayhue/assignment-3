//Handles any/all database connections.

import 'dotenv/config';
import pg from 'pg';

export const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DV_PASSWORD,
    database: process.env.DB_NAME
});

