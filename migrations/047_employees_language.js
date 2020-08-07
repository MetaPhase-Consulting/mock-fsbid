exports.up = function(knex) {
  return knex.schema
    .createTable('employees_languages', function(table) {
      table.integer('perdet_seq_num')
      table.string('language_code')

      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
      table.foreign('language_code').references('languages.language_code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees_languages');
};
