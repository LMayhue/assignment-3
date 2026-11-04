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
import {isRecipeFavorite, toggleFavorite} from '../models/favorites.js';

export const recipesRouter = express.Router();

//Check if the given recipe is owned by the logged in user
const checkRecipeOwner = (recipe, req) => {
    if (recipe.user_id == req.user.id) {
        return true;
    }
    return false;
}

//Makes sure the given input is a number. If not, returns null or 0
const getValidInput = (input) => {
    //not a number (ie 'abc', '')
    if (!/^\d+$/.test(input)) {
        return null;
    }
    return Number(input);
};

//Reads the html form and verifies inputs are valid
const readRecipeForm = (body) => {
    const errors = [];

    const title = body.title;
    const description = body.description;
    const ingredients = body.ingredients;
    const instructions = body.instructions;
    const prepTime = body.prep_time;
    const cookTime = body.cook_time;
    const servings = body.servings;

    //Verify required fields are present (Requires title, ingredients, instructions)
    if (title.trim() === '') {
        errors.push('Title is required.');
    };
    if (ingredients.trim() === '') {
        errors.push('Ingredients are required.');
    };
    if (instructions.trim() === '') {
        errors.push('Instructions are required.');
    };

    const formItems = {
        title: title,
        description: description,
        ingredients: ingredients,
        instructions: instructions,
        prep_time: prepTime,
        cook_time: cookTime,
        servings: servings
    }

    return {formItems, errors};
};

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
        search,
    });
});

//GET /recipes/new - Display form to create a new recipe
recipesRouter.get('/recipes/new', requireLogin, (req, res) => {
    res.render('recipes/new', {
        title: 'New Recipe'
    })
});

//GET /recipes/:id - View a single recipe with its details and number of favorites
recipesRouter.get('/recipes/:id', async (req, res, next) => {
    //Make sure the id is a valid number
    if (!/^\d+$/.test(req.params.id)) {
        const error = new Error;
        error.statusCode = 404;
        return next(error);
    }

    //Get the recipe from the given Id
    const recipeId = Number(req.params.id);
    const recipe = await getRecipeById(recipeId);
    if (!recipe) {
        const error = new Error;
        error.statusCode = 404;
        return next(error);
    };
    
    let isOwner = false;
    let isFavorited = false;
    //If the user is logged in, check if they are the owner and if they have favorited it
    if (req.user) {
        isOwner = checkRecipeOwner(recipe, req);
        isFavorited = await isRecipeFavorite(recipe.id, req.user.id);
    };
    //display the recipe page
    res.render('recipes/show', {
        title: recipe.title,
        recipe,
        isFavorited,
        isOwner
    })
})

//***PROTECTED***
//POST /recipes - Create a new recipe
recipesRouter.post('/recipes', requireLogin, async (req, res) => {
    //Verify all the inputs are valid
    const {formItems, errors} = readRecipeForm(req.body);
    if (errors.length > 0) {
        return res.status(400).render('recipes/new', {
            title: 'New Recipe',
            recipe: formItems,
            errors
        });
    }

    //(Requires title, ingredients, instructions)
    const recipeData = {
        title: formItems.title,
        description: formItems.description, 
        ingredients: formItems.ingredients,
        instructions: formItems.instructions,
        prep_time: getValidInput(formItems.prep_time),
        cook_time: getValidInput(formItems.cook_time),
        servings: getValidInput(formItems.servings),
        user_id: req.user.id
    };

    //Save recipe, redirect to recipe page
    const newRecipe = await createRecipe(req.user.id, recipeData);
    res.redirect(`/recipes/${newRecipe.id}`);
});

//GET /recipes/:id/edit - Display form to edit a recipe (only the recipe owner can edit)
recipesRouter.get('/recipes/:id/edit', requireLogin, async (req, res, next) => {
    //Make sure the given Id is valid
    if (!/^\d+$/.test(req.params.id)) {
        const error = new Error;
        error.statusCode = 404;
        return next(error);
    }
    
    const recipe = await getRecipeById(Number(req.params.id));
    if (!checkRecipeOwner(recipe, req)) {
        const error = new Error;
        error.statusCode = 403;
        return next(error);
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
recipesRouter.post('/recipes/:id', requireLogin, async (req, res, next) => {
    const thisRecipe = await getRecipeById(Number(req.params.id));
    if (!checkRecipeOwner(thisRecipe, req)) {
        const error = new Error;
        error.statusCode = 403;
        return next(error);
    };

    const {formItems, errors} = readRecipeForm(req.body);
    if (errors.length > 0) {
        return res.status(400).render('recipes/edit', {
            title: `Edit ${thisRecipe.title}`,
            errors,
            recipe: {...formItems, id: thisRecipe.id}
        });
    };

    const recipeData = {
        title: formItems.title,
        description: formItems.description, 
        ingredients: formItems.ingredients,
        instructions: formItems.instructions,
        prep_time: getValidInput(formItems.prep_time),
        cook_time: getValidInput(formItems.cook_time),
        servings: getValidInput(formItems.servings),
        user_id: req.user.id
    };

    await editRecipe(thisRecipe.id, recipeData);
    res.redirect(`/recipes/${thisRecipe.id}`);
});

//POST /recipes/:id/delete - Delete a recipe (only the recipe owner can delete)
recipesRouter.post('/recipes/:id/delete', requireLogin, async (req, res, next) => {
    const recipe = await getRecipeById(Number(req.params.id));
    //Verify the user is actually the owner
    if (!checkRecipeOwner(recipe, req)) {
        const error = new Error;
        error.statusCode = 403;
        return next(error);
    };

    await deleteRecipe(recipe.id);
    res.redirect('/my-recipes');
});

//POST /recipes/:id/favorite - Add/remove a recipe from favorites
recipesRouter.post('/recipes/:id/favorite', requireLogin, async (req, res, next) => {
    const recipe = await getRecipeById(Number(req.params.id));
    //Verify the user is actually the owner
    if (!recipe) {
        const error = new Error;
        error.statusCode = 404;
        return next(error);
    };

    await toggleFavorite(recipe.id, req.user.id);
    res.redirect(`/recipes/${recipe.id}`);
});
