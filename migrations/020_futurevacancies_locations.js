exports.up = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.dropColumn('post_org_country_state')

      table.foreign('pos_location_code').references('locations.location_code')

    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.string('post_org_country_state')

      table.dropForeign('pos_location_code')
  });
};
