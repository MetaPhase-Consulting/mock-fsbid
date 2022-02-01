exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitems', function(table) {
        table.integer('aiseqnum').primary()

        table.integer('pmiseqnum')
        table.string('aiscode')
        table.foreign('pmiseqnum').references('panelmeetingitems.pmiseqnum')
        table.foreign('aiscode').references('agenda_item_statuses.aiscode')

        table.integer('empseqnbr')
        table.integer('perdetseqnum')
        table.string('todcode')
        table.string('toddesctext')
        table.integer('aicombinedtodmonthsnum')
        table.string('aicombinedtodothertext')
        table.string('aicorrectiontext')
        table.string('ailabeltext')
        table.integer('aicreateid')
        table.date('aicreatedate')
        table.integer('aiupdateid')
        table.date('aiupdatedate')
        table.integer('aiseqnumref')
        table.integer('aiitemcreatorid')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitems')
};
