exports.up = function(knex) {
    return knex.schema
        .createTable('assignmentdetails', function(table) {
            table.integer('asgd_code').primary()

            table.integer('asgseqnum')
            table.string('asgscode')
            table.string('latcode')
            table.string('todcode')
            table.integer('ailseqnum')
            table.string('orgcode')
            table.foreign('asgseqnum').references('assignments.asg_seq_num')
            table.foreign('asgscode').references('assignments.asgs_code')
            table.foreign('latcode').references('legactiontype.latcode')
            table.foreign('todcode').references('tourofduties.code')
            table.foreign('ailseqnum').references('agendaitemlegs.ailseqnum')
            table.foreign('orgcode').references('organizaions.code')

            table.integer('asgdrevisionnum')
            table.string('asgdtodothertext')
            table.integer('asgdtodmonthsnum')
            table.date('asgdetadate')
            table.integer('asgdadjustmonthsnum')
            table.date('asgdetdteddate')
            table.string('asgdsalaryreimburseind')
            table.string('asgdtravelreimburseind')
            table.string('asgdtrainingind')
            table.integer('asgdcreateid')
            table.date('asgdcreatedate')
            table.integer('asgdupdateid')
            table.date('asgdupdatedate')
            table.string('asgdnotecommenttext')
            table.string('asgdpriorityind')
            table.string('asgdcriticalneedind')
        });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('assignmentdetails')
};