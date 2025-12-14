const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const tokenHeader = req.header('Authorization');
    
    if (!tokenHeader) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    const token = tokenHeader.startsWith("Bearer ") 
      ? tokenHeader.slice(7, tokenHeader.length) 
      : tokenHeader;

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = verified;
    next();

  } catch (err) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = auth;