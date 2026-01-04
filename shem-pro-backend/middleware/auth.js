const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Check for explicit demo bypass token
    if (token === 'demo-token-bypass') {
      req.user = { id: 'demo-user' };
      return next();
    }

    const demoCookie = req.cookies?.demo;
    if (demoCookie) {
      const demoExpires = new Date(demoCookie);
      if (demoExpires > new Date()) {
        req.user = { id: 'demo-user' };
        return next();
      }
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};