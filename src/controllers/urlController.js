const Url = require('../models/Url');
const { createClient } = require("redis");

const redis = createClient();

redis.on("error", (err) => console.log("Redis Error", err));

(async () => {
  await redis.connect();   // ⚠️ required
})();

const generateShortCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortCode = '';
  for (let i = 0; i < 8; i++) {
    shortCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortCode;
};

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

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const urlObj = await redis.get(originalUrl)//need to send the data
    console.log("redis data",urlObj);
    if(urlObj!==null){
        const value = JSON.parse(urlObj);
        return res.status(200).json({
        message: 'URL already shortened',
        originalUrl: value.originalUrl,
        shortCode: value.shortCode,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/urls/${value.shortCode}`,
        createdAt: value.createdAt,
      });
    }

    let url = await Url.findOne({ originalUrl });
    
    if (url) {
      redis.set(originalUrl, JSON.stringify(url));
      return res.status(200).json({
        message: 'URL already shortened',
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/urls/${url.shortCode}`,
        createdAt: url.createdAt,
      });
    }

    let shortCode;
    let exists = true;
    while (exists) {
      shortCode = generateShortCode();
      exists = await Url.findOne({ shortCode });
    }

    url = new Url({
      originalUrl,
      shortCode,
    }); 
    redis.set(originalUrl, JSON.stringify(url));
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

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const clickKey = `clicks:${shortCode}`;
    const currentClicks = await redis.get(clickKey);
    const newClickCount = currentClicks ? parseInt(currentClicks, 10) + 1 : 1;
    await redis.set(clickKey, newClickCount.toString());

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