
const express = require('express');
const connectDb = require('./config/db');
const urlRouter = require('./routers/urlRouter');
const { initializeCronJob } = require('./services/cronService');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


const app = express();
connectDb();

initializeCronJob();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  message: 'Too many requests from this IP address, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.ip || req.connection.remoteAddress;
  },
});


app.use(globalLimiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});



app.use('/api/urls', urlRouter);


app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;