import express from 'express';
import {requireLogin} from '../middleware/auth.js';
import {
    getAllRecipes,
    getRecipeById,
    getRecipesByUserId,
    createRecipe,
    editRecipe,
    deleteRecipe
} from '../models/recipes.js';

export const recipesRouter = express.Router();

//***PUBLIC***
//GET /recipes - Browse all recipes
recipesRouter.get('/recipes', async (req, res)=> {
    //get all the recipes (w/ optional search term)
    let search = "";
    if (req.query.q) {
        search = req.query.q.trim();
    }
    const recipes = await getAllRecipes(search);

    //Display the recipes using `index.hbs` template
    res.render('recipes/index', {
        title: 'Browse Recipes',
        recipes,
        recipeCount: recipes.length,
        searchTerm,
    });
});

//GET /recipes/:id - View a single recipe with its details and number of favorites
recipesRouter.get('/recipes/:id', async (req, res) => {
    //get the recipe from the id
    const recipeId = Number(req.params.id);
    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
        return res.status(404);
    }

    res.render('recipes/show', {
        title: recipe.title,
        recipe
    })
    //display the recipe page
})

//***PROTECTED***
    //GET /recipes/new - Display form to create a new recipe
    //POST /recipes - Create a new recipe
    //GET /recipes/:id/edit - Display form to edit a recipe (only the recipe owner can edit)
    //POST /recipes/:id - Update a recipe (only the recipe owner can update)
    //POST /recipes/:id/delete - Delete a recipe (only the recipe owner can delete)
    //POST /recipes/:id/rate - Rate a recipe (1-5 stars)
    //POST /recipes/:id/favorite - Add/remove a recipe from favorites
