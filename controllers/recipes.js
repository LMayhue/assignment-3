import express from 'express';
import {requireLogin} from '../middleware/auth.js';

export const recipesRouter = express.Router();

//***PUBLIC***
//GET /recipes - Browse all recipes
recipesRouter.get('/recipes', (req, res)=> {
    //get all the recipes
    //display them using the card format in recipe/index.hbs
});

    //GET /recipes/:id - View a single recipe with its details, average rating, and number of favorites

//***PROTECTED***
    //GET /recipes/new - Display form to create a new recipe
    //POST /recipes - Create a new recipe
    //GET /recipes/:id/edit - Display form to edit a recipe (only the recipe owner can edit)
    //POST /recipes/:id - Update a recipe (only the recipe owner can update)
    //POST /recipes/:id/delete - Delete a recipe (only the recipe owner can delete)
    //POST /recipes/:id/rate - Rate a recipe (1-5 stars)
    //POST /recipes/:id/favorite - Add/remove a recipe from favorites
