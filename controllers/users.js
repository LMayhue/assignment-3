import express from 'express';
import bcrypt from 'bcrypt';
import {createUser, findUserById, findUserByUsername, findUserByEmail, verifyUser} from '../models/users.js';
import {getRecipesByUserId} from '../recipes.js';

export const userRouter = express.Router();

//bcrypt stuff
const SALT_ROUNDS = 10;

//Check values
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


//***PUBLIC***
//GET /users/:id - View a user's profile showing their recipes
userRouter.get('/login/:id', async (req, res) => {
    //Get the info needed to make the page (user, users recipes)
    const userId = parseint(req.params.id);
    const profile = await findUserById(userId);
    const recipes = await getRecipesByUserId(userId);

    res.render('users/show', {
        title: profile.username,
        profile,
        recipes,
        recipeCount: recipes.length        
    });
});

//GET /login - Login page. Redirect the user to the original URI after login
userRouter.get('/login', (req, res) => {
    res.render('users/login', {
        title: 'Log In',
        redirect: req.query.redirect
    });
});

//POST /login - actually login


//GET /register - Registration page
userRouter.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register'
    });
});
    
//POST /register - actually create a new user
userRouter.post('/register', async (req, res) => {
    const username = req.body.username.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const existingUser = findUserByUsername(username);
    const existingEmail = findUserByEmail(email);

    //collect a list of all the input faults to display
    const errors = [];

    //Validate inputs, push to 'errors' if something is wrong
    if (username == "") {
        errors.push("A Username is required.");
    }
    else if (existingUser) {
        errors.push("That Username is already taken.")
    }

    if (email == "") {
        errors.push("An Email is required.");
    }
    else if (existingEmail) {
        errors.push("That Email is already taken.")
    }

    if (password == "") {
        errors.push("A Password is required.");
    }

    //If errors happened, status code 400 and tell the user what happened
    if (errors.length > 0) {
        return res.status(400).render('users/register', {
            title: 'Register',
            errors,
            username,
            email,
        })
    }

    //Start creating the user
    const passHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await createUser(username, email, passHash);

    //Start a session and redirect the user to '/'
    await startSession(res, newUser.id);
    res.redirect('/');
});

//***REQUIRE AUTH***
    // POST /logout - Logout