import express from 'express';
import {engine} from 'express-handlebars';
import {loggingMiddleware} from './middleware/logging';
import {errorHandler} from './middleware/error-handling';


//Express & handlebars initialization
const app = express();
app.engine("handlebars", engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


//applicable middleware
app.use(express.static("public"));
app.use(loggingMiddleware);

app.use(errorHandler);




//Endpoints
app.get("/", (req, res) => {
    res.render('home', {

    });
});




//Start the server
app.listen(process.env.PORT, () => {
    console.log("Server running on process.env.PORT");
})