exports.up = function(knex) {
  return knex.schema
    .createTable('roles', function(table) {
      table.string('code').primary();;
      table.string('description');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('roles');
};