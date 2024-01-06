import { db } from 'configs/database';

const create = user => db('users').insert(user);

const findOne = filter => db('users').where(filter).first();

const update = (filter, data) => db('users').where(filter).update(data);

export default {
  create,
  findOne,
  update
};
