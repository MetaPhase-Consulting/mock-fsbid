exports.up = function(knex) {
  return knex.schema
    .createTable('organizations', function(table) {
      table.string('code').primary();
      table.string('short_desc');
      table.string('long_desc');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('organizations');
};