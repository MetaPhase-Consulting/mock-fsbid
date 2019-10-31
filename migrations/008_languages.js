exports.up = function(knex) {
  return knex.schema
    .createTable('languages', function(table) {
      table.string('language_code').primary();
      table.string('language_short_desc');
      table.string('language_long_desc');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('languages');
};