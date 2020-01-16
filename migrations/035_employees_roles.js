exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.dropColumn('role')
    })
    .createTable('employees_roles', function(table) {
      table.integer('perdet_seq_num')
      table.string('code')

      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
      table.foreign('code').references('roles.code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees_roles')
    .alterTable('employees', function(table) {
      table.string('role')
    })
};