exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.string('grade_code')

      table.foreign('grade_code').references('grades.grade_code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.dropForeign('grade_code')
      table.dropColumn('grade_code')
  });
};