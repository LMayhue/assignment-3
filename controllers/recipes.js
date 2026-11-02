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

const checkRecipeOwner = async (recipe, req) => {
    if (recipe.user_id == req.user.id) {
        return true;
    }
    return false;
}

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

//GET /recipes/new - Display form to create a new recipe
recipesRouter.get('/recipes/new', requireLogin, (req, res) => {
    res.render('recipes/new', {
        title: 'New Recipe'
    })
});

//GET /recipes/:id - View a single recipe with its details and number of favorites
recipesRouter.get('/recipes/:id', async (req, res) => {
    //get the recipe from the id
    const recipeId = Number(req.params.id);
    const recipe = await getRecipeById(recipeId);

    if (!recipe) {
        return res.status(404);
    }

    //display the recipe page
    res.render('recipes/show', {
        title: recipe.title,
        recipe
    })
})

//***PROTECTED***
//POST /recipes - Create a new recipe


//GET /recipes/:id/edit - Display form to edit a recipe (only the recipe owner can edit)
recipesRouter.get('/recipes/:id/edit', requireLogin, async (req, res) => {
    const recipe = await getRecipeById(Number(req.params.id));
    if (!checkRecipeOwner(recipe, req)) {
        return res.status(403);
    };

    res.render('recipes/edit', {
        title: `Edit ${recipe.title} Recipe`,
        recipe
    });
});

// GET /my-recipes - View the current user's own recipes
recipesRouter.get('/my-recipes', requireLogin, async (req, res) => {
    const recipes = await getRecipesByUserId(req.user.id);

    res.render('my-recipes', {
        title: 'My Recipes',
        recipes
    });
});

//POST /recipes/:id - Update a recipe (only the recipe owner can update)


//POST /recipes/:id/delete - Delete a recipe (only the recipe owner can delete)


//POST /recipes/:id/favorite - Add/remove a recipe from favorites
