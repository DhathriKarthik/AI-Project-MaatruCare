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

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;   // <-- comes from login token
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};