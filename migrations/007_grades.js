exports.up = function(knex) {
  return knex.schema
    .createTable('grades', function(table) {
      table.string('grade_code').primary();
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('grades');
};