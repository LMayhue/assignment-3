//All sessions queries abide in this locale
import crypto from 'crypto';
import pool from '../db/connection.js';

//Create a new session tied to a user id. Session id will then be used in a cookie
export const createSession = async (userId) => {
    const sessionId = crypto.randomBytes(32).toString('hex');

    const sql = `
        INSERT INTO sessions (session_id, user_id)
        VALUES ($1, $2)
    `;

    await pool.query(sql, [sessionId, userId]);
    return sessionId;
};

//find a user based on the session id
export const findUserBySession = async (sessionId) => {
    const sql = `
        SELECT users.id, users.username, users.email, users.created_at
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessons.session_id = $1
    `;

    const result = await pool.query(sql, [sessionId]);
    return result.rows[0];
};

//delete a session on Logout
export const deleteSession = async (sessionId) => {
    const sql = `
        DELETE FROM sessions
        WHERE session_id = $1
    `;

    await pool.query(sql, [sessionId]);
};