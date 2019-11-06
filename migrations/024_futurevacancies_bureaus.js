exports.up = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.string('bureau')
      table.dropColumn('bureau_desc')

      table.foreign('bureau').references('bureaus.bur')

    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.dropForeign('bureau')
      table.dropColumn('bureau')
  });
};