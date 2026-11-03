//All authentication stuff happens here
import {createSession, findUserBySession, deleteSession} from '../models/session.js';

//Load in a user if the session cookie is valid
export const loadUser = async (req, res, next) => {
    const sessionId = req.cookies.session_id;

    req.user = undefined;
    res.locals.user = undefined;

    //get the user that the cookie belongs to
    const user = await findUserBySession(sessionId);
    //if the cookie has no user linked, continue as not logged in
    if (!user) {
        return next();
    }
    //else, set the req/res user to the user.
    req.user = user;
    res.locals.user = user;
    next()
};

//Require a user be logged in to access the resource
export const requireLogin = (req, res, next) => {
    if (!req.user) {
        const error = new Error;
        error.statusCode = 401;
        next(error); //auth error, sends to error handler
    };
    next();
};

//Create a session & cookie for a user that logged in
export const startSession = async (res, userId) => {
    const newSession = await createSession(userId);

    res.cookie('session_id', newSession, {
    maxAge: 60 * 60 * 1000, // 1 minute in milliseconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
};

//Remove a session & cookie for a user that logged out
export const endSession = async (req, res) => {
    const session = req.cookies.session_id;
    await deleteSession(session);

    res.clearCookie('session_id');
};