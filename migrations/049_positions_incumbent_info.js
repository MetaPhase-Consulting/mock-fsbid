exports.up = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.string('incumbent_perdet_seq_num')
      table.integer('last_updated_user')
      table.timestamp('last_updated_date').default(knex.fn.now())
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.dropColumn('incumbent_perdet_seq_num')
      table.dropColumn('last_updated_user')
      table.dropColumn('last_updated_date')
  });
};
