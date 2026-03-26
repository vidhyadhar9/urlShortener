const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// POST - Create a shortened URL (submit a long URL to shorten it)
router.post('/', urlController.shortenUrl);

// Optional: GET all URLs (for admin/testing purposes) - must come before /:shortCode
router.get('/all', urlController.getAllUrls);

// GET - Retrieve original URL from shortened code (when user accesses the shortened URL)
router.get('/:shortCode', urlController.redirectUrl);

module.exports = router;
