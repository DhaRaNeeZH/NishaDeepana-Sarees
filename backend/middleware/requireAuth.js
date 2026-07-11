// ================================================================
// requireAuth — JWT middleware for any logged-in user
// Attaches req.user from token. Does NOT require admin role.
// Usage: router.get('/:email', requireAuth, handler)
// ================================================================
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Authentication required' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = requireAuth;
