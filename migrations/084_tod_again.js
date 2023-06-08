exports.up = function(knex) {
  return knex.schema
    .alterTable('toursofduty', function(table) {
      table.string('todstatuscode');
    });
};
exports.down = function(knex) {
  return knex.schema
    table.dropColumn('todstatuscode')
};
