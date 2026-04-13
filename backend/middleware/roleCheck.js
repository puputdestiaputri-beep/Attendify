const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!req.userRole || !roles.includes(req.userRole)) {
            return res.status(403).json({ 
                status: 'error', 
                message: 'Access Denied: You do not have the required role.' 
            });
        }
        next();
    }
};

module.exports = checkRole;
