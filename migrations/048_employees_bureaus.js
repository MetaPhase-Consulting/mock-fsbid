exports.up = function(knex) {
  return knex.schema
    .createTable('employees_bureaus', function(table) {
      table.integer('perdet_seq_num')
      table.string('bur')

      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
      table.foreign('bur').references('bureaus.bur')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees_bureaus');
};
