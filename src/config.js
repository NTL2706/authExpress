const config = {
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY || '',
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY || '',
    CLIENT_ID: process.env.CLIENT_ID || '',
    CLIENT_SECRETS: process.env.CLIENT_SECRETS || '',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_DB: process.env.REDIS_DB || 0,
    REDIS_USER_NAME: process.env.REDIS_USER_NAME || '',
    REDIS_PASS: process.env.REDIS_PASS || '',
    TIME_EXPIRE_RESET_PW: 10 * 2,
    TIME_EXPIRE_ACCESS_TOKEN: 60 * 5,
    TIME_EXPIRE_REFRESH_TOKEN: 60 * 60,
};

module.exports = config;
