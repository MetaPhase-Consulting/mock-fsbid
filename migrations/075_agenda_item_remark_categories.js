exports.up = function(knex) {
  return knex.schema
    .createTable('agenda_item_remark_categories', function(table) {
      table.string('rccode').primary()
      table.string('rcdesctext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agenda_item_remark_categories');
};
