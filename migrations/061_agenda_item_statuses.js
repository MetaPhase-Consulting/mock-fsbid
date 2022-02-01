exports.up = function(knex) {
  return knex.schema
    .createTable('agenda_item_statuses', function(table) {
      table.string('aiscode').primary()
      table.string('aisabbrdesctext')
      table.string('aisdesctext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agenda_item_statuses');
};
