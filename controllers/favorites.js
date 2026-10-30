import express from 'express';

export const favoritesRouter = express.Router();

//REQUIRES AUTH. Display a users favorites
favoritesRouter.get('/favorites', (req, res) => {
    

    res.render('favorites', {
        title: 'Favorites',

    })
});