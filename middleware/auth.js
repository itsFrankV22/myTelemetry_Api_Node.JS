export function authMiddleware(req, res, next) {
    if (!req.session.loggedIn) {
        return res.redirect('/login.html');
    }
    next();
}