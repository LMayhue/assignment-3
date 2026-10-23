export const loggingMiddleware = (req, res, next) => {
    console.log(`REQUEST: ${req.method} ${req.path}`)
    next();
    console.log(`RESPONSE: ${res.statusCode} ${res.statusMessage}`)
}