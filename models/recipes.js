//All the recipe queries live here
import {pool} from '../db/connection.js';

//Set up starter query for all recipes
    //Gets all the recipe table columns as well as:
    /* - recipe author as a username (simplifies searching and/or displaying author name)
       - how many times the recipe has been favorited (simplifies the process to display this in the recipe card) */
const BASIC_QUERY = `
SELECT
    recipes.id,
    recipes.title,
    recipes.description,
    recipes.ingredients,
    recipes.instructions,
    recipes.prep_time,
    recipes.cook_time,
    recipes.servings,
    recipes.user_id,
    recipes.created_at,
    recipes.updated_at,
    users.username AS author,
    (SELECT COUNT(*)
        FROM favorites
        WHERE favorites.recipe_id = recipes.id)::int AS favorite_count
FROM recipes
JOIN users ON users.id = recipes.user_id
`;

//Re-format search queries so all chars are valid strings
const escapeChars = (text) => {
    return text.replace(/[\\%_]/g, '\\$&');
};


//***READ DATABASE***
//Include all functions that only read the database tables

//Return all recipes with the optional search string
export const getAllRecipes = async (searchStr) => {
    let sql = BASIC_QUERY;
    const searchValues = [];
    //add the "ILIKE" search term in the sql query if the user did a search
    if (searchStr) {
        sql += `
        WHERE recipes.title ILIKE $1
        OR recipes.ingredients ILIKE $1
        `
        searchValues.push(`%${escapeChars(searchStr)}%`); 
    }

    //Make all the recipes appear in descending order from when they were updated
    sql += `
        ORDER BY recipes.updated_at DESC
    `;

    const result = await pool.query(sql, searchValues);
    return result.rows;
}

//Return one recipe searched for by id
export const getRecipeById = async (recipeId) => {
    const sql = `
        ${BASIC_QUERY}
        WHERE recipes.id = $1
    `;

    const result = await pool.query(sql, [recipeId]);
    return result.rows;
};

//Return recipes written by a specific user
export const getRecipesByUserId = async (userId) => {
    const sql = `
        ${BASIC_QUERY}
        WHERE author = $1
        ORDER BY recipes.created_at DESC
    `;

    const result = await pool.query(sql, [userId]);
    return result.rows;
}

//Return recipes a specific user has favorited
export const getUserFavoriteRecipes = async (userId) => {
    const sql = `
        ${BASIC_QUERY}
        JOIN favorites ON favorites.recipe_id = recipes.id
        WHERE favortes.user_id = $1
        ORDER BY favorites.created_at DESC
    `;

    const result = await pool.query(sql, [userId]);
    return result.rows;
};

//Get recently created recipes (3 for homepage)
export const getRecentRecipes = async () => {
    const sql = `
        ${BASIC_QUERY}
        ORDER BY recipes.created_at DESC
        LIMIT 3
    `;

    const result = await pool.query(sql);
    return result.rows;
};

//***MODIFY DATABASE***
//Include any functions that modify database tables

//Create a new recipes. Returns the new recipe id
export const createRecipe = async (userId, values) => {
    const sql = `
        INSERT INTO recipes (
            title,
            description,
            ingredients,
            instructions,
            prep_time,
            cook_time,
            servings,
            user_id    
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
    `;
    const recipeValues = [
        values.title,
        values.description,
        values.ingredients,
        values.instructions,
        values.prepTime,
        values.cookTime,
        values.servings,
        userId,
    ];

    const result = await pool.query(sql, recipeValues);
    return result.rows;
};

//Edit a recipe
export const editRecipe = async (recipeId, values) => {
    const sql = `
        UPDATE recipes
        SET 
            title = $1,
            description = $2,
            ingredients = $3,
            instructions = $4,
            prep_time = $5,
            cook_time = $6,
            servings = $7,
            updated_at = NOW()
        WHERE id = $8
        RETURNING id
    `;
    const updateValues = [
        values.title,
        values.description,
        values.ingredients,
        values.instructions,
        values.prepTime,
        values.cookTime,
        values.servings,
        recipeId
    ];

    const result = await pool.query(sql, updateValues);
    return result.rows;
};

//Delete a recipe. Returns the number of rows deleted (1 = success, 0 = fail/ didn't exist)
export const deleteRecipe = async (recipeId) => {
    const sql = `
        DELETE FROM recipes
        WHERE id = $1
    `;

    const result = await pool.query(sql, [recipeId]);
    return result.rowCount;
};