exports.up = function(knex) {
  return knex.schema
    .alterTable('assignments', function(table) {
      table.timestamp('eta_date')
      table.timestamp('etd_ted_date')
    })
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('assignments', function(table) {
      table.dropColumn('eta_date')
      table.dropColumn('etd_ted_date')
    })
};