
const express = require('express');
const connectDb = require('./config/db');
const urlRouter = require('./routers/urlRouter');
const { initializeCronJob } = require('./services/cronService');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


const app = express();
connectDb();

// Initialize cron job for syncing clicks
initializeCronJob();

// Global rate limiter - 1000 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP address, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
});

// Apply global rate limiter to all routes
app.use(globalLimiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

// Routes

app.use('/api/urls', urlRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;