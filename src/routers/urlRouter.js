const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { createUrlLimiter, redirectLimiter, getAllUrlsLimiter } = require('../middleware/rateLimiter');

// POST - Create a shortened URL (submit a long URL to shorten it)
// Rate limit: 10 requests per hour per IP
router.post('/', createUrlLimiter, urlController.shortenUrl);

// Optional: GET all URLs (for admin/testing purposes) - must come before /:shortCode
// Rate limit: 5 requests per minute per IP
router.get('/all', getAllUrlsLimiter, urlController.getAllUrls);

// GET - Retrieve original URL from shortened code (when user accesses the shortened URL)
// Rate limit: 100 requests per minute per IP
router.get('/:shortCode', redirectLimiter, urlController.redirectUrl);

module.exports = router;
