//Log the request method and path, and then when the response gets sent, log the status
export const loggingMiddleware = (req, res, next) => {
    console.log(`REQUEST: ${req.method} ${req.path}`);

    res.on('finish', () => {
        console.log(`RESPONSE: ${res.statusCode} ${res.statusMessage}`);
    });

    next();
};