import express from 'express';
import bcrypt from 'bcrypt';
import {createUser, findUserById, findUserByUsername, findUserByEmail, verifyUser} from '../models/users.js';
import {getRecipesByUserId} from '../models/recipes.js';
import {requireLogin, endSession, startSession} from '../middleware/auth.js';

export const userRouter = express.Router();

//bcrypt stuff
const SALT_ROUNDS = 10;

//Check values
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


//***PUBLIC***
//GET /users/:id - View a user's profile showing their recipes
userRouter.get('/users/:id', async (req, res) => {
    //Get the info needed to make the page (user, users recipes)
    const userId = parseInt(req.params.id);
    const profile = await findUserById(userId);
    //if the user doesn't exist, send 404
    if (!profile) {
        return res.status(404);
    }

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

//POST /login - actually login (User can use username or email)
userRouter.post('/login', async (req, res) => {
    //Address to redirect the user to after login
    const redirect = req.body.redirect;

    //If a field is empty, tell the user
    const errors = [];
    if (req.body.usernameEmail === '') {
        errors.push('Please enter your username or email.');
    }
    if (req.body.password === '') {
        errors.push('Please enter your password.');
    }
    if (errors.length > 0) {
        res.status(400).render('users/login', {
            title: 'Log In',
            input: req.body.usernameEmail,
            errors,
            redirect
        })
    };

    //Verify the password for the given user
    const correctUser = await verifyUser(req.body.usernameEmail);
    const userPassHash = correctUser.password_hash;
    const passwordMatch = await bcrypt.compare(req.body.password, userPassHash)

    //if the password is not correct, tell the user and don't log in
    if (!passwordMatch) {
        res.status(401).render('users/login', {
            title: 'Log in',
            errors: ['Wrong username/email or password'],
            input: req.body.usernameEmail,
            redirect
        })
    };
    
    //start the session & cookie if password is correct
    await startSession(res, req.user.id);
    res.redirect(redirect);
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

    const existingUser = findUserByUsername(username);
    const existingEmail = findUserByEmail(email);

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