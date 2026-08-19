const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    let token = req.cookies ? req.cookies.token : undefined;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access Denied: No Authentication Token Found' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('[JWT Verification Error]', error);
    res.status(401).json({ 
      success: false, 
      message: 'Access Denied: Invalid or Expired Token' 
    });
  }
};

