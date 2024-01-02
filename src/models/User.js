const db = require('../../config/database');

const create = (user) => db('users').insert(user);

const findOne = (filter) => db('users').where(filter).first();

const update = (filter, data) => db('users').where(filter).update(data);

module.exports = {
  create,
  findOne,
  update,
};
