exports.up = function(knex) {
  return knex.schema
    .alterTable('bids', function(table) {
      table.string('handshake_allowed_ind')
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('bids', function(table) {
      table.dropColumn('handshake_allowed_ind')
  });
};
