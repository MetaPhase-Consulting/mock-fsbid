exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitemlegs', function(table) {
      table.integer('rmrkseqnum').primary()

      table.integer('aiseqnum')
      table.foreign('aiseqnum').references('agendaitems.aiseqnum')

      table.string('airremarktext')
      table.string('aircompleteind')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitemlegs')
};