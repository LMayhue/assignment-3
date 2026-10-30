import 'dotenv/config'
import express from 'express';
import {engine} from 'express-handlebars';
import {loggingMiddleware} from './middleware/logging.js';
import {errorHandler} from './middleware/error-handling.js';
import {homeRouter} from './controllers/home.js';
//import {favoritesRouter} from './controllers/favorites.js';
//import {recipesRouter} from './controllers/recipes.js';
//import {userRouter} from './controllers/users.js';

//Express & handlebars initialization
const app = express();
app.engine("handlebars", engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


//applicable middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(loggingMiddleware);

app.use(errorHandler);

//Routers/endpoints
app.use(homeRouter);
//app.use(favoritesRouter);
//app.use(recipesRouter);
//app.use(userRouter);

//For testing. Will get moved to a separate file later
app.get("/", (req, res) => {
    res.render('home', {
        title: "Home"
    });
});

//Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
})