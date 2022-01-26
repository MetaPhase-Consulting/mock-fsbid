exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitemlegs', function(table) {
      table.integer('ailseqnum').primary()

      table.integer('aiseqnum')
      table.integer('cpid')
      table.string('todcode')
      table.string('latcode')
      table.integer('asgdrevisionnum')
      table.foreign('aiseqnum').references('agendaitems.aiseqnum')
      table.foreign('cpid').references('availablepositions.cp_id')
      table.foreign('todcode').references('tourofduties.code')
      table.foreign('latcode').references('legactiontype.latcode')
      table.foreign('asgdrevisionnum').references('assignments.asgd_revision_num')

      table.integer('posseqnum')
      table.integer('empseqnbr')
      table.integer('perdetseqnum')
      table.integer('ailtodmonthsnum')
      table.string('ailtodothertext')
      table.date('ailetadate')
      table.date('ailetdtedsepdate')
      table.string('ailcitytext')
      table.string('ailcountrystatetext')
      table.string('ailemprequestedsepind')
      table.integer('asgseqnum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitemlegs')
};