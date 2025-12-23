const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const tokenHeader = req.header('Authorization');

    if (!tokenHeader) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const token = tokenHeader.startsWith("Bearer ") 
      ? tokenHeader.slice(7).trim() 
      : tokenHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user) {
      req.user = decoded.user;
    } else {
      req.user = decoded;
    }

    next();

  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = auth;