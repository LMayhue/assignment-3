import express from 'express';

export const homeRouter = express.Router();

//home page. Show 3 featured recipes and 3 recent recipes. Show if the user is logged in.
homeRouter.get('/', async (req, res) => {

    res.render('home', {
        title: 'Home'
    })
})