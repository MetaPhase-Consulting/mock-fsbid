exports.up = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.string('org_code')

      table.foreign('org_code').references('organizations.code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.dropForeign('org_code')
      table.dropColumn('org_code')
  });
};