//All Queries for Favorites will live here
import {pool} from '../db/connection.js';

//Get all the favorite recipe ids for a specific user
//(Just used in this file, not exported)
const getFavoritesByUserId = async (userId) => {
    const sql = `
        SELECT recipe_id
        FROM favorites
        WHERE user_id = $1
    `;

    const result = await pool.query(sql, [userId]);
    return result.rows.map(row => row.recipe_id);
}

//Toggle a favorite on/off. returns true for on, false for off
export const toggleFavorite = async (recipeId, userId) => {
    const deleteSql = `
        DELETE FROM favorites
        WHERE recipe_id = $1
            AND user_id = $2
        RETURNING id    
    `;
    const insertSql = `
        INSERT INTO favorites (recipe_id, user_id)
        VALUES ($1, $2)
    `;

    //If it already exists, remove it
    const result = await pool.query(deleteSql, [recipeId, userId]);

    //If nothing got deleted, add it to the list
    if (result.rowCount == 0) {
        await pool.query(insertSql, [recipeId, userId]);
        return true;
    };

    return false;
};

//check if a recipe is favorited by a specific user
export const isRecipeFavorite = async (recipeId, userId) => {
    //search recipes for recipeId w/userId
    const sql = `
        SELECT id
        FROM favorites
        WHERE recipe_id = $1
            AND user_id = $2
    `;

    const result = await pool.query(sql, [recipeId, userId]);
    //false if returned rows are empty, true if it returned something
    if (!result.rows[0]) {
        return false;
    };
    return true;
};

// Add `is_favorited` to each recipe in a given recipe list
    //This makes marking favorites easier in the templates
export const markFavorites = async(recipes, userId) => {
    const favorites = await getFavoritesByUserId(userId);
    for (const recipe of recipes) {
        //adds true to each. Recipes without this tag are seen as false
        recipe.is_favorited = favorites.includes(recipe.id);
    }; 

    return recipes;
};