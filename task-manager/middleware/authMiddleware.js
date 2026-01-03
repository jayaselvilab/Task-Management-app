const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Get the token from the header
    let token = req.header('Authorization');

    // 2. If no token, block access
    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }

    try {
        // 3. Remove "Bearer " if it's there
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trim();
        }

        // 4. VERIFY - FIXED: Now uses the secret from your .env file
        // This MUST match what is in your authController login function
        const secret = process.env.JWT_SECRET || 'MY_SUPER_SECRET_KEY';
        const decoded = jwt.verify(token, secret); 
        
        req.user = decoded; // Saves { id: user.id } to the request
        next(); 
    } catch (err) {
        console.error("JWT Verification Error:", err.message);
        res.status(401).json({ error: "Token is not valid" });
    }
};