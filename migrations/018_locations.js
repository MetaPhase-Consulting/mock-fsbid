exports.up = function(knex) {
  return knex.schema
    .createTable('locations', function(table) {
      table.string('code').primary();
      table.string('city');
      table.string('state');
      table.string('country');
      table.integer('is_domestic')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('locations');
};