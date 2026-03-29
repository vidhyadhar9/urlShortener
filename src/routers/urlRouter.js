const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { createUrlLimiter, redirectLimiter, getAllUrlsLimiter } = require('../middleware/rateLimiter');

router.post('/', createUrlLimiter, urlController.shortenUrl);


router.get('/all', getAllUrlsLimiter, urlController.getAllUrls);


router.get('/:shortCode', redirectLimiter, urlController.redirectUrl);

module.exports = router;
