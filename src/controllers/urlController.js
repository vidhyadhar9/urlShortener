const Url = require('../models/Url');

// Function to generate a random short code
const generateShortCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < 6; i++) {
    shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortCode;
};

// Function to validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Validate input
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL already exists
    let url = await Url.findOne({ originalUrl });
    
    if (url) {
      return res.status(200).json({
        message: 'URL already shortened',
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/urls/${url.shortCode}`,
        createdAt: url.createdAt,
      });
    }

    // Generate unique short code
    let shortCode;
    let exists = true;
    while (exists) {
      shortCode = generateShortCode();
      exists = await Url.findOne({ shortCode });
    }

    // Create new URL document
    url = new Url({
      originalUrl,
      shortCode,
    });

    await url.save();

    res.status(201).json({
      message: 'URL shortened successfully',
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/urls/${url.shortCode}`,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error('Error in shortenUrl:', error);
    res.status(500).json({ error: 'Error shortening URL', details: error.message });
  }
};

const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the URL by short code
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click counter
    url.clicks += 1;
    await url.save();

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error in redirectUrl:', error);
    res.status(500).json({ error: 'Error retrieving URL', details: error.message });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      message: 'List of all URLs',
      total: urls.length,
      urls: urls.map((url) => ({
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/urls/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error in getAllUrls:', error);
    res.status(500).json({ error: 'Error retrieving URLs', details: error.message });
  }
};

module.exports = {
  shortenUrl,
  redirectUrl,
  getAllUrls,
};