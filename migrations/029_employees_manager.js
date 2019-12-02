exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.integer('manager_id')

      table.foreign('manager_id').references('employees.perdet_seq_num')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.dropForeign('manager_id')
      table.dropColumn('manager_id')
  });
};