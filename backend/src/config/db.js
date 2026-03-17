const dns = require('dns');
const mongoose = require('mongoose');

// Use Google DNS for SRV lookups -- works around networks that block SRV queries
dns.setServers(['8.8.8.8', '8.8.4.4']);

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 15000;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_health_kiosk';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
      return;
    } catch (err) {
      const isWhitelist = err.message && err.message.includes('whitelist');
      console.error(isWhitelist
        ? `MongoDB Atlas: IP not whitelisted (attempt ${attempt}/${MAX_ATTEMPTS}). Add 0.0.0.0/0 at https://cloud.mongodb.com → Network Access.`
        : `MongoDB connection failed (attempt ${attempt}/${MAX_ATTEMPTS}):`, err.message);
      if (attempt === MAX_ATTEMPTS) throw err;
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}

module.exports = connectDB;
