exports.up = function(knex) {
  return knex.schema
    .alterTable('bids', function(table) {
      table.string('cdo_bid')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('bids', function(table) {
      table.dropColumn('cdo_bid')
  });
};
