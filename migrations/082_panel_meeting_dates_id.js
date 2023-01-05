exports.up = function(knex) {
  return knex.schema
    .alterTable('panelmeetingdates', function(table) {
      table.dropColumn('id')

      table.increments('testing_this_id').primary();
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('panelmeetingdates', function(table) {
      table.string('id')

      table.dropColumn('testing_this_id')
    });
};
