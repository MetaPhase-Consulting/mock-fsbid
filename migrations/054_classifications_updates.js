exports.up = function(knex) {
  return knex.schema
    .alterTable('employees_classifications', function(table) {
      table.integer('bsn_id').nullable()
      table.unique(['td_id', 'perdet_seq_num'])
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees_classifications', function(table) {
      table.dropUnique(['td_id', 'perdet_seq_num'])
      table.dropColumn('bsn_id')
    });
};
