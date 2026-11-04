//All Queries for Favorites will live here
import {pool} from '../db/connection.js';

//Get the number of favorites a specific recipe has
export const getNumFavorites = async (recipeId) => {
    const sql = `
        SELECT
            COUNT(id)
        FROM favorites
        GROUP BY id
        WHERE id = $1
    `;

    const result = await pool.query(sql, [recipeId])
    return result.rows[0]; //num of favorites
};

//Toggle a favorite on/off
export const toggleFavorite = async (recipeId, userId) => {
    //If it already exists, remove it

    //Else, add it

    return ;//favorite id
};

//check if a recipe is favorited by a specific user
export const isRecipeFavorite = async (recipeId, userId) => {
    //search recipes for recipeId w/userId
    const sql = `
        SELECT id
        FROM favorites
        WHERE 
            recipe_id = $1,
            user_id = $2
    `;

    const result = await pool.query(sql, [recipeId, userId]);
    //false if returned rows are empty, true if it returned something
    if (!result.rows[0]) {
        return false;
    };
    return true;
};