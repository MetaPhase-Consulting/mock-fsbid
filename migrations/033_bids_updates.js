exports.up = function(knex) {
  return knex.schema
    .alterTable('bids', function(table) {
      table.timestamp('panel_meeting_date');
      table.string('panel_meeting_status');
      table.timestamp('assignment_date');
      table.string('assignment_status');
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('bids', function(table) {
      table.dropColumn('panel_meeting_date')
      table.dropColumn('panel_meeting_status')
      table.dropColumn('assignment_date')
      table.dropColumn('assignment_status')
    });
};