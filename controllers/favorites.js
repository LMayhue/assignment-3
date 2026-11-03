import express from 'express';
import {requireLogin} from '../middleware/auth.js'
import {getUserFavoriteRecipes} from '../models/recipes.js';

export const favoritesRouter = express.Router();

//***REQUIRES AUTH.***
//Display a users favorites
favoritesRouter.get('/favorites', requireLogin, (req, res) => {
    const recipes = getUserFavoriteRecipes(req.user.id);

    res.render('favorites', {
        title: 'Favorites',
        user: req.user,
        recipes
    })
});