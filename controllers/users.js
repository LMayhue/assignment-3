import express from 'express';

export const userRouter = express.Router();

//***PUBLIC***
    //GET /users/:id - View a user's profile showing their recipes
    //GET /login - Login page
    //GET /register - Registration page

//***REQUIRE AUTH***
    // POST /logout - Logout
    // GET /my-recipes - View the current user's own recipes