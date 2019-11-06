exports.up = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.string('bureau')
      table.dropColumn('pos_bureau_short_desc')

      table.foreign('bureau').references('bureaus.bur')

    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.dropForeign('bureau')
      table.dropColumn('bureau')
  });
};