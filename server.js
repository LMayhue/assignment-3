import 'dotenv/config'
import express from 'express';
import {engine} from 'express-handlebars';
import cookieParser from 'cookie-parser';
import {loggingMiddleware} from './middleware/logging.js';
import {errorHandler} from './middleware/error-handling.js';
import {loadUser} from './middleware/auth.js';
import {homeRouter} from './controllers/home.js';
import {favoritesRouter} from './controllers/favorites.js';
import {recipesRouter} from './controllers/recipes.js';
import {userRouter} from './controllers/users.js';

const formatDate = (date) => {
    const dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    };

    return new Date(date).toLocaleString('en-US', dateOptions);
};


//Express & handlebars initialization
const app = express();
app.engine("handlebars", engine({
    helpers: {
        formatDate
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

//applicable middleware
app.use(express.urlencoded({extended:true})); //Get url params
app.use(express.static("public")); //Serve statics
app.use(loggingMiddleware); //Log req, res
app.use(cookieParser()); //Parse cookies
app.use(loadUser); // Load the user id from cookie

//Routers/handlers
app.use(homeRouter);
app.use(favoritesRouter);
app.use(recipesRouter);
app.use(userRouter);

//If a path happens that doesn't get caught by a handler, it's a 404
app.use((req, res, next) => {
    const error = new Error();
    error.statusCode = 404;
    next(error);
});

//Error handler, needs to come after everything else
app.use(errorHandler);

//Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
})