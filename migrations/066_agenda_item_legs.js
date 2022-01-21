exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitemlegs', function(table) {
      table.integer('ailseqnum').primary()

      table.integer('aiseqnum')
      table.string('latcode')
      table.foreign('aiseqnum').references('agendaitems.aiseqnum')
      table.foreign('latcode').references('legactioncode.latcode')



      table.string('tfcd')
      table.integer('cpid')
      table.integer('empseqnbr')
      table.integer('perdetseqnum')
      table.integer('posseqnum')
      table.string('todcode')
      table.integer('ailtodmonthsnum')
      table.string('ailtodothertext')
      table.date('ailetadate')
      table.date('ailetdtedsepdate')
      table.string('dsccd')
      table.string('ailcitytext')
      table.string('ailcountrystatetext')
      table.string('ailusind')
      table.string('ailemprequestedsepind')
      table.integer('asgseqnum')
      table.integer('asgdrevisionnum')
      table.integer('sepseqnum')
      table.integer('sepdrevisionnum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitemlegs')
};