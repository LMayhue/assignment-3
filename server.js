import express from 'express';
import {engine} from 'express-handlebars';
import { loggingMiddleware } from './middleware/logging';


//Express & handlebars initialization
const app = express();
app.engine("handlebars", engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


//applicable middleware
app.use(express.static("static"));
app.use(loggingMiddleware);


//Endpoints
app.get("/", (req, res) => {
    res.render('home', {

    });
});




//Start the server
app.listen(5008, () => {
    console.log("Server running on 5008");
})