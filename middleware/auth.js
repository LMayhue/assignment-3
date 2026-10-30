

//Use it to require a login 
export const requireLogin = (req, res, next) => {
    if (!res.user) {
        return; //redirect the user to the login page
    }
    next();
};