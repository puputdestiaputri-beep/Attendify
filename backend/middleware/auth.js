const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ status: 'error', message: 'No token provided!' });
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('JWT Verification Error:', err.message);
            console.log('Token received:', token ? token.substring(0, 10) + '...' : 'null');
            return res.status(401).json({ status: 'error', message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

module.exports = verifyToken;
