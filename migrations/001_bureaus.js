exports.up = function(knex) {
  return knex.schema
    .createTable('bureaus', function(table) {
      table.string('bur').primary();
      table.string('bureau_short_desc');
      table.string('bureau_long_desc');
      table.integer('isregional')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('bureaus');
};