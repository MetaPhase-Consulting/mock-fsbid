exports.up = function(knex) {
  return knex.schema
    .createTable('tourofduties', function(table) {
      table.string('code').primary();
      table.string('long_desc');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('tourofduties');
};