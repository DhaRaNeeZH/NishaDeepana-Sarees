// ================================================================
// adminOnly — JWT middleware that requires role === 'admin'
// Usage: router.post('/', adminOnly, handler)
// ================================================================
const jwt = require('jsonwebtoken');

function adminOnly(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = adminOnly;
