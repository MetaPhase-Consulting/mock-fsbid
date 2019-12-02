exports.up = function(knex) {
  return knex.schema
    .createTable('employees_skills', function(table) {
      table.integer('perdet_seq_num')
      table.integer('jc_id')

      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
      table.foreign('jc_id').references('codes.jc_id')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees_skills');
};