const rateLimit = require('express-rate-limit');

// Custom IPv6-safe keyGenerator
const customKeyGenerator = (req, res) => {
  // Get the client IP
  let ip = req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           'unknown';
  
  // Handle IPv6-mapped IPv4 addresses (::ffff:x.x.x.x)
  if (ip && ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }
  
  return ip;
};

const createUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Too many URLs created from this IP address, please try again after 1 hour',
  },
  standardHeaders: true, 
  legacyHeaders: false,
  validate: false,
  keyGenerator: customKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many URLs created from this IP address',
      retryAfter: req.rateLimit.resetTime,
      message: 'Please try again after 1 hour',
    });
  },
});

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, 
  message: {
    error: 'Too many requests from this IP address, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: customKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP address',
      retryAfter: req.rateLimit.resetTime,
      message: 'Please try again in a moment',
    });
  },
});

const getAllUrlsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: 'Too many requests to retrieve all URLs from this IP address',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: customKeyGenerator,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP address',
      retryAfter: req.rateLimit.resetTime,
      message: 'Please try again in a moment',
    });
  },
});

module.exports = {
  createUrlLimiter,
  redirectLimiter,
  getAllUrlsLimiter,
};
