const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
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
