import express from 'express';

export const recipesRouter = express.Router();

//PUBLIC
    //GET /recipes - Browse all recipes
    //GET /recipes/:id - View a single recipe with its details, average rating, and number of favorites

//PROTECTED
    //GET /recipes/new - Display form to create a new recipe
    //POST /recipes - Create a new recipe
    //GET /recipes/:id/edit - Display form to edit a recipe (only the recipe owner can edit)
    //POST /recipes/:id - Update a recipe (only the recipe owner can update)
    //POST /recipes/:id/delete - Delete a recipe (only the recipe owner can delete)
    //POST /recipes/:id/rate - Rate a recipe (1-5 stars)
    //POST /recipes/:id/favorite - Add/remove a recipe from favorites
