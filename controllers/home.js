import express from 'express';
import {getRecentRecipes} from '../models/recipes.js';
import {markFavorites} from '../models/favorites.js';

export const homeRouter = express.Router();

//home page. Show 3 recent recipes. Show if the user is logged in.
homeRouter.get('/', async (req, res) => {
    const recentRecipes = await getRecentRecipes();

    //If user is logged in, mark favorite recipes
    if (req.user) {
        await markFavorites(recentRecipes, req.user.id);
    };

    res.render('home', {
        title: 'Home',
        recentRecipes
    });
});