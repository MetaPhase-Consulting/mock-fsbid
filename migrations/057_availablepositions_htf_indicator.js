exports.up = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.string('hard_to_fill_ind')
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.dropColumn('hard_to_fill_ind')
  });
};
