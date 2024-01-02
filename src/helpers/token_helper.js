const jwt = require('jsonwebtoken')
const config = require('../config')
const redis = require('../../config/redis.config')

function genToken(payload) {
  const accessToken = jwt.sign(payload, config.ACCESS_TOKEN_KEY, {
    expiresIn: config.TIME_EXPIRE_ACCESS_TOKEN,
  })

  const refreshToken = jwt.sign({ accessToken }, config.REFRESH_TOKEN_KEY, {
    expiresIn: config.TIME_EXPIRE_REFRESH_TOKEN,
  })

  redis.set(
    `accessToken/${accessToken}`,
    JSON.stringify({ refreshToken }),
    'EX',
    config.TIME_EXPIRE_REFRESH_TOKEN + 60 * 2
  )
  redis.set(
    `refreshToken/${refreshToken}`,
    {},
    'EX',
    config.TIME_EXPIRE_REFRESH_TOKEN + 60 * 2
  )

  return { accessToken, refreshToken }
}

module.exports = {
  genToken,
}
