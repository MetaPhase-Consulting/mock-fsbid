exports.up = function(knex) {
  return knex.schema
    .createTable('employees_organizations', function(table) {
      table.integer('perdet_seq_num')
      table.string('org_code')

      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
      table.foreign('org_code').references('organizations.code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees_organizations');
};
