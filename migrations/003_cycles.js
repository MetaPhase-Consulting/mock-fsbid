exports.up = function(knex) {
  return knex.schema
    .createTable('cycles', function(table) {
      table.increments('cycle_id').primary();
      table.string('cycle_name');
      table.string('cycle_status_code');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('cycles');
};