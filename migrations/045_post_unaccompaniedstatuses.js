exports.up = function(knex) {
  return knex.schema
    .alterTable('locations', function(table) {
      table.integer('us_code');

      table.foreign('us_code').references('unaccompaniedstatuses.us_code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('locations', function(table) {
      table.dropColumn('us_code')
  });
};
