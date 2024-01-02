const Redis = require('ioredis');
const config = require('../src/config');

const redis = new Redis({
  host: config.REDIS_HOST || '127.0.0.1',
  port: config.REDIS_PORT || 6379,
  db: config.REDIS_DB || 0,
})

redis.on('connect', async () => {
  console.log('Redis client connected');
});

redis.on('error', async (err) => {
  console.log(`Something went wrong ${err}`);
});

module.exports = redis;
