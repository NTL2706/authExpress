import knex from 'knex';

const knexConfig = require('../../../knexfile');

const environment = process.env.DATABASE_ENV || 'development';

export default knex(knexConfig[environment]);
