const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({message: 'Missing token for authentication.'});
        }

        // Verify the token and matches with database
        try {
            const decodedToken = jwt.verify(token, process.env.TOKEN_KEY );
            req.user = decodedToken;
            console.log(`/auth: ${req.user.username} - Authentication successful`);
        } catch (err) {
            return res.status(403).send("Invalid token.");
        }
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({message: `Authentication error: ${err}`});
    }
}

module.exports = checkToken;