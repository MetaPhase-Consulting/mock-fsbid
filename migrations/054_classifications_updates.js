exports.up = function(knex) {
  return knex.schema
    .alterTable('classifications', function(table) {
      table.integer('te_id')
      table.string('te_descr_txt')
      table.integer('rnum')
      table.unique('te_id')
    })
    .alterTable('employees_classifications', function(table) {
      table.dropForeign('td_id')
      table.dropColumn('td_id')
    })
    .alterTable('classifications', function(table) {
      table.dropColumn('td_id')
    })
    .alterTable('employees_classifications', function(table) {
      table.increments('td_id').primary()
      table.integer('te_id')
      table.foreign('te_id').references('classifications.te_id')
      table.unique(['te_id', 'perdet_seq_num'])
    })
    
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees_classifications', function(table) {
      table.dropColumn('td_id')
      table.dropUnique(['te_id', 'perdet_seq_num'])
      table.dropForeign('te_id')
      table.dropColumn('te_id')
    })
    .alterTable('classifications', function(table) {
      table.increments('td_id').primary()
    })
    .alterTable('employees_classifications', function(table) {
      table.integer('td_id')
      table.foreign('td_id').references('classifications.td_id')
    })
    .alterTable('classifications', function(table) {
      table.dropUnique('te_id')
      table.dropColumns('te_id', 'te_descr_txt', 'rnum')
    })
};
