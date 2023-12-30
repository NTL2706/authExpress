/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary().unsigned();
    table.string('username', 255).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.tinyint('confirmed', 1).nullable();
    table.string('secret', 255).notNullable();
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
};
