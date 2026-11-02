import express from 'express';
import {requireLogin} from '../middleware/auth.js'

export const favoritesRouter = express.Router();

//***REQUIRES AUTH.***
//Display a users favorites
favoritesRouter.get('/favorites', requireLogin, (req, res) => {
    

    res.render('favorites', {
        title: 'Favorites',
        user: req.user
    })
});