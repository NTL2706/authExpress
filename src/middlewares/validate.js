import { check } from 'express-validator';
import jwt from 'jsonwebtoken';

import { CONFIG } from 'configs/constants';
import { redis } from 'configs/database';

async function validateToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).send({ error: 'Not authorized to access this resource' });
  }

  try {
    const payload = jwt.verify(token, CONFIG.ACCESS_TOKEN_KEY);
    const result = await redis.get(`accessToken/${token}`);

    if (!result) {
      return res.status(401).send({ error: 'Not authorized to access this resource' });
    }

    req.user = { token, payload };
    next();
  } catch (e) {
    return res.status(403).send({ error: 'Token is expired or invalid' });
  }
}

const emailValidation = check('email').isEmail().withMessage('Please enter a valid email address');

const passwordValidation = check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

export { validateToken, emailValidation, passwordValidation };
