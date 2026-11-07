//All the users queries live in this file
//ONLY PULL THE PASSWORD HASH WHEN NECCESSARY (security reasons)
import {pool} from '../db/connection.js';

//***READ ONLY QUERIES***
//Find a user by Id
export const findUserById = async (userId) => {
    const sql = `
        SELECT id, username, email, created_at
        FROM users
        WHERE id = $1
    `;

    const result = await pool.query(sql, [userId]);
    return result.rows[0];
};

//Find a user by Username
export const findUserByUsername = async (userName) => {
    const sql = `
        SELECT id, username, email, created_at
        FROM users
        WHERE username = $1
    `;

    const result = await pool.query(sql, [userName]);
    return result.rows[0];
};

//Find a user by Email
export const findUserByEmail = async (userEmail) => {
    const sql = `
        SELECT id, username, email, created_at
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(sql, [userEmail]);
    return result.rows[0];
};

//Find a user whos trying to log in, verify password (needs passHash)(Could use username or email)
export const verifyUser = async (userOrEmail) => {
    const sql = `
        SELECT id, username, email, password_hash
        FROM users
        WHERE username = $1
            Or email = $1
    `;

    const result = await pool.query(sql, [userOrEmail]);
    return result.rows[0];
};


//***MODIFY DATABASE QUERIES***
//Create a user (returns user id)
export const createUser = async (username, email, passHash) => {
    const sql = `
        INSERT INTO users (
            username,
            email,
            password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING id
    `;
    const userValues = [username, email, passHash];

    const result = await pool.query(sql, userValues);
    return result.rows[0];
};

// Remove a user (Can only be accessed through the terminal)
    //Returns the number of rows deleted (1 is success, 0 is failure)
export const removeUserById = async (userId) => {
    const sql = `
        DELETE FROM users
        WHERE id = $1
    `;
    
    const result = await pool.query(sql, [userId]);
    return result.rowCount;
};