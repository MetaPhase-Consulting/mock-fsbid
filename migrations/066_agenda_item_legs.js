exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitemlegs', function(table) {
      table.integer('ailseqnum').primary()

      table.integer('aiseqnum')
      table.string('latcode')
      table.foreign('aiseqnum').references('agendaitems.aiseqnum')
      table.foreign('latcode').references('legactiontype.latcode')

      table.integer('cpid')
      table.integer('posseqnum')
      table.integer('empseqnbr')
      table.integer('perdetseqnum')
      table.string('todcode')
      table.integer('ailtodmonthsnum')
      table.string('ailtodothertext')
      table.date('ailetadate')
      table.date('ailetdtedsepdate')
      table.string('ailcitytext')
      table.string('ailcountrystatetext')
      table.string('ailemprequestedsepind')
        // grab from details table - maybe - might just have static data here
      table.integer('asgseqnum')
      table.integer('asgdrevisionnum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitemlegs')
};