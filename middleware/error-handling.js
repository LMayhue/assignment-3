export const errorHandler = (error, req, res, next) => {
    //Handle errors (404, not authenticated(401), not authorized (402))
        //Output a user friendly message about what happened
        //Redirect to necessary pages if needed (id. user login)
    
    //401 = auth needed. redirect to login page
    if (error.statusCode == 401) {
        return res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}`);
    }

    //403 = not allowed to see this as the logged in user
    if (error.statusCode == 403) {
        res.status(403);
        res.render('error', {
            title: 'Not Allowed',
            message: `You are not allowed to see ${req.path}`
        })
    }

    //404 = resource was not found
    if (error.statusCode == 404) {
        res.status(404);
        res.render('error', {
            title: 'Not Found',
            message: `${req.path} was not found`
        })
    }

    next();

};