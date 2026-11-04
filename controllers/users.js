import express from 'express';
import bcrypt from 'bcrypt';
import {
    createUser,
    findUserById,
    findUserByUsername,
    findUserByEmail,
    verifyUser
} from '../models/users.js';
import {getRecipesByUserId} from '../models/recipes.js';
import {requireLogin, endSession, startSession} from '../middleware/auth.js';
import {markFavorites} from '../models/favorites.js';

export const userRouter = express.Router();

//bcrypt salt
const SALT_ROUNDS = 10;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//***PUBLIC***
//GET /users/:id - View a user's profile showing their recipes
userRouter.get('/users/:id', async (req, res, next) => {
    //Make sure the id is a valid number
    if (!/^\d+$/.test(req.params.id)) {
        const error = new Error;
        error.statusCode = 404;
        return next(error);
    }

    //Get the info needed to make the page (user, users recipes)
    const profile = await findUserById(Number(req.params.id));
    //if the user doesn't exist, send 404
    if (!profile) {
        const error = new Error;
        error.statusCode = 404;
        return next(error);
    }

    const recipes = await getRecipesByUserId(Number(req.params.id));
    if (req.user) {
        await markFavorites(recipes, req.user.id)
    }

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

//POST /login - actually login (User can use username or email)
userRouter.post('/login', async (req, res) => {
    //Address to redirect the user to after login
    const redirect = req.body.redirect;

    //If a field is empty, tell the user
    const errors = [];
    if (req.body.usernameEmail.trim() === '') {
        errors.push('Please enter your username or email.');
    }
    if (req.body.password.trim() === '') {
        errors.push('Please enter your password.');
    }
    if (errors.length > 0) {
        return res.status(400).render('users/login', {
            title: 'Log In',
            input: req.body.usernameEmail,
            errors,
            redirect
        })
    };

    //Make sure the username/email given actually exists
    const correctUser = await verifyUser(req.body.usernameEmail);
    if (!correctUser) {
        return res.status(401).render('users/login', {
            title: 'Log in',
            errors: ['Wrong username/email or password.'],
            input: req.body.usernameEmail,
            redirect
        });
    };

    //Verify the password matches the given user
    const userPassHash = correctUser.password_hash;
    const passwordMatch = await bcrypt.compare(req.body.password, userPassHash)
    //if the password is not correct, tell the user and don't log in
    if (!passwordMatch) {
        return res.status(401).render('users/login', {
            title: 'Log in',
            errors: ['Wrong username/email or password'],
            input: req.body.usernameEmail,
            redirect
        });
    };
    
    //start the session & cookie, redirect the user to either the requested URI or '/' if redirect is empty
    await startSession(res, correctUser.id);
    res.redirect(redirect || '/');
});

//GET /register - Registration page
userRouter.get('/register', (req, res) => {
    res.render('users/register', {
        title: 'Register'
    });
});
    
//POST /register - actually create a new user
userRouter.post('/register', async (req, res) => {
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const existingUser = await findUserByUsername(username);
    const existingEmail = await findUserByEmail(email);

    //collect a list of all the input faults to display
    const errors = [];

    if (username == "") {
        errors.push("A Username is required.");
    }
    else if (existingUser) {
        errors.push("That Username is already taken.")
    }

    if (email == "") {
        errors.push("An Email is required.");
    }
    else if (!EMAIL_PATTERN.test(email)) {
        errors.push("A valid Email address is required.")
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

    //Create the user after creating the password hash
    const passHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await createUser(username, email, passHash);

    //Start a session and redirect the user to '/'
    await startSession(res, newUser.id);
    res.redirect('/');
});

//***REQUIRE AUTH***
// POST /logout - Logout the user, remove the cookie & session
userRouter.post('/logout', requireLogin, async (req, res) => {
    await endSession(req, res);
    res.redirect('/');
});