import jwt from 'jsonwebtoken';

import { CONFIG } from 'configs/constants';
import { redis } from 'configs/database';

export function genToken(payload) {
  const accessToken = jwt.sign(payload, CONFIG.ACCESS_TOKEN_KEY, {
    expiresIn: CONFIG.TIME_EXPIRE_ACCESS_TOKEN
  });

  const refreshToken = jwt.sign({ accessToken }, CONFIG.REFRESH_TOKEN_KEY, {
    expiresIn: CONFIG.TIME_EXPIRE_REFRESH_TOKEN
  });

  redis.set(
    `accessToken/${accessToken}`,
    JSON.stringify({ refreshToken }),
    'EX',
    CONFIG.TIME_EXPIRE_REFRESH_TOKEN + 60 * 2
  );
  redis.set(`refreshToken/${refreshToken}`, {}, 'EX', CONFIG.TIME_EXPIRE_REFRESH_TOKEN + 60 * 2);

  return { accessToken, refreshToken };
}
