exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitemstatuses', function(table) {
      table.string('aiscode').primary()
      table.string('aisabbrdesctext')
      table.string('aisdesctext')
      table.integer('aisordernum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitemstatuses')
};