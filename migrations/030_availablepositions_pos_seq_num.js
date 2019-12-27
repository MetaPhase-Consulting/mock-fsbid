exports.up = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.string('pos_seq_num')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      knex.schema.hasColumn('availablepositions', 'pos_seq_num').then(flag => {
        return flag && table.dropColumn('pos_seq_num')
      });
  });
};