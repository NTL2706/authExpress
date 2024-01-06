import Redis from 'ioredis';

import { CONFIG } from 'configs/constants';

const redis = new Redis({
  host: CONFIG.REDIS_HOST,
  port: CONFIG.REDIS_PORT,
  db: CONFIG.REDIS_DB,
  username: CONFIG.REDIS_USER_NAME,
  password: CONFIG.REDIS_PASS
});

export default redis;
