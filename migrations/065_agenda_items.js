exports.up = function(knex) {
  return knex.schema
    .createTable('agendaitems', function(table) {
      table.integer('aiseqnum').primary()
      table.string('aiscode')
      table.integer('pmiseqnum')
      table.string('aicombinedremarktext')
      table.integer('aicombinedtodmonthsnum')
      table.string('aicombinedtodothertext')
      table.string('aicorrectiontext')
      table.string('ailabeltext')
      table.integer('aiseqnumref')
      table.string('aisorttext')
      table.integer('aicreateid')
      table.date('aicreatedate')
      table.integer('aiupdateid')
      table.date('aiupdatedate')
      table.integer('aiitemcreatorid')

      table.foreign('aiscode').references('agendaitemstatuses.aiscode')
      table.foreign('pmiseqnum').references('panelmeetingitems.pmiseqnum')

//?   PERDET_SEQ_NUM	NUMBER foreign? waiting on answer
      table.integer('perdetseqnum')
      // table.foreign('perdetseqnum').references('')
//?   EMP_SEQ_NBR	NUMBER   probs foreign
      table.integer('empseqnbr')
      // table.foreign('empseqnbr').references('')
//?   ASG_SEQ_NUM	NUMBER(9,0) - probs foreign
      table.integer('asgseqnum')
      // table.foreign('asgseqnum').references('')
//?   TOD_CODE	VARCHAR2(1 CHAR)
      table.string('todcode')
      // table.foreign('todcode').references('')
//?   ASGD_REVISION_NUM	NUMBER(3,0)
      table.integer('asgdrevisionnum')
      // table.foreign('asgdrevisionnum').references('')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('agendaitems')
};
