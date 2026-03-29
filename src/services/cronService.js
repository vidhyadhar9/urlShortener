const cron = require('node-cron');
const Url = require('../models/Url');
const { createClient } = require("redis");

const redis = createClient();

redis.on("error", (err) => console.log("Redis Error", err));

(async () => {
  await redis.connect();
})();

// Initialize cron job to sync clicks from Redis to MongoDB every 10 minutes
const initializeCronJob = () => {

  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Cron job started: Syncing clicks to database...');
      
      const keys = await redis.keys('clicks:*');
      
      if (keys.length === 0) {
        console.log('✅ No pending clicks to sync');
        return;
      }

      // Batch update all URLs with pending clicks
      for (const key of keys) {
        const shortCode = key.replace('clicks:', '');
        const pendingClicks = await redis.get(key);
        
        if (pendingClicks !== null) {
          const clicks = parseInt(pendingClicks, 10);
          
          // Update MongoDB with accumulated clicks
          await Url.updateOne(
            { shortCode },
            { $inc: { clicks } }
          );

          // Clear the Redis entry after successful update
          await redis.del(key);
          console.log(`✅ Updated ${shortCode} with ${clicks} clicks`);
        }
      }

      console.log('✅ Cron job completed: All clicks synced to database');
    } catch (error) {
      console.error('❌ Error in cron job:', error);
    }
  });

  console.log('✅ Cron job initialized - Clicks will be synced every 10 minutes');
};

module.exports = {
  initializeCronJob,
};
