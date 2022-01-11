exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitemstatuses', function(table) {
      table.string('aiscode').primary()
      table.string('aisabbrdesctext')
      table.string('aisdesctext')
      table.integer('aisordernum')
      table.integer('aiscreateid')
      table.date('aiscreatedate')
      table.integer('aisupdateid')
      table.date('aisupdatedate')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitemstatuses')
};