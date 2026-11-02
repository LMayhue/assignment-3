import express from 'express';
import {getRecentRecipes} from '../models/recipes.js';

export const homeRouter = express.Router();

//home page. Show 3 recent recipes. Show if the user is logged in.
homeRouter.get('/', async (req, res) => {
    const recentRecipes = await getRecentRecipes();

    res.render('home', {
        title: 'Home',
        recentRecipes
    });
});