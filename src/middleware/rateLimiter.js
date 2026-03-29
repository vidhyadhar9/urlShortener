const rateLimit = require('express-rate-limit');

// Rate limiter for creating short URLs - 10 requests per hour per IP
const createUrlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many URLs created from this IP address, please try again after 1 hour',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    // Use IP address as the key
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many URLs created from this IP address',
      retryAfter: req.rateLimit.resetTime,
      message: 'Please try again after 1 hour',
    });
  },
});

// Rate limiter for redirects (clicking short URLs) - 100 requests per minute per IP
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP address, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP address',
      retryAfter: req.rateLimit.resetTime,
      message: 'Please try again in a moment',
    });
  },
});

// Rate limiter for getting all URLs - 5 requests per minute per IP
const getAllUrlsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests to retrieve all URLs from this IP address',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
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
