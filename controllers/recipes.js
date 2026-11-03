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

//Reads the html form and verifies inputs are valid
const readRecipeForm = (body) => {
    const errors = [];
    //Requires title, ingredients, instructions. DB requires adtl user_id

    const title = body.title;
    const description = body.description;
    const ingredients = body.ingredients;
    const instructions = body.instructions;
    const prepTime = body.prep_time;
    const cookTime = body.cook_time;
    const servings = body.servings;

    //Verify required fields are present
    if (title === '') {
        errors.push('Title is required.');
    };
    if (ingredients === '') {
        errors.push('Ingredients are required.');
    };
    if (instructions === '') {
        errors.push('Instructions are required.');
    };

    const formFields = {
        title,
        description,
        ingredients,
        instructions,
        prep_time: prepTime,
        cook_time: cookTime,
        servings
    }

    return {formFields, errors}
};

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

    const recipeData = {
        title: formItems.title,
        description: formItems.description, 
        ingredients: formItems.ingredients,
        instructions: formItems.instructions,
        prep_time: Number(formItems.prepTimeStr),
        cook_time: Number(formItems.cookTimeStr),
        servings: Number(formItems.servingsStr)
    };

    //Save recipe, redirect to recipe page
    const newRecipe = await createRecipe(req.user.id, recipeData);
    res.redirect(`/recipes/${newRecipe.id}`);
});


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
recipesRouter.post('/recipes/:id', requireLogin, async (req, res) => {
    const thisRecipe = await getRecipeById(Number(req.params.id));
    if (!checkRecipeOwner(thisRecipe, req)) {
        return res.status(403);
    };

    const {formItems, errors} = readRecipeForm(req.body);
    if (errors.length > 0) {
        return res.status(400).render('recipes/edit', {
            title: `Edit ${thisRecipe.title}`,
            errors,
            recipe: formItems
        });
    };

    const recipeValues = {
        title: formItems.title,
        description: formItems.description, 
        ingredients: formItems.ingredients,
        instructions: formItems.instructions,
        prep_time: Number(formItems.prepTimeStr),
        cook_time: Number(formItems.cookTimeStr),
        servings: Number(formItems.servingsStr)
    };

    await editRecipe(thisRecipe.id, recipeValues);
    res.redirect(`/recipes/${thisRecipe.id}`);
});

//POST /recipes/:id/delete - Delete a recipe (only the recipe owner can delete)
recipesRouter.post('/recipes/:id/delete', requireLogin, async (req, res) => {
    const recipe = getRecipeById(Number(req.params.id));
    if (!checkRecipeOwner(recipe, req)) {
        return res.status(403);
    };

    await deleteRecipe(recipe.id);
    res.redirect('/my-recipes');
});

//POST /recipes/:id/favorite - Add/remove a recipe from favorites
recipesRouter.post('/recipes/:id/favorite', requireLogin, async (req, res) => {
    
});
