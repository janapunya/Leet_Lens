const jwt = require('jsonwebtoken');
function authcontroller(req,res,next) {
    const { user_cookie } = req.cookies;
    try {
        const user = jwt.verify(user_cookie, process.env.JWT_SECRET);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
}
module.exports = { authcontroller }