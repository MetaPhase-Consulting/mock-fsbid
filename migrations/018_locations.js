exports.up = function(knex) {
  return knex.schema
    .createTable('locations', function(table) {
      table.string('location_code').primary();
      table.string('location_city');
      table.string('location_state');
      table.string('location_country');
      table.integer('is_domestic')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('locations');
};
