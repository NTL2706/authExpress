const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.DATABASE_ENV || 'development';

module.exports = knex(knexConfig[environment]);
