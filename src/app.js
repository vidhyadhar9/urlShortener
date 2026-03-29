
const express = require('express');
const connectDb = require('./config/db');
const urlRouter = require('./routers/urlRouter');
const { initializeCronJob } = require('./services/cronService');
require('dotenv').config();


const app = express();
connectDb();

// Initialize cron job for syncing clicks
initializeCronJob();

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