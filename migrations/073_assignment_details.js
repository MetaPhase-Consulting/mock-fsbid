exports.up = function(knex) {
    return knex.schema
        .createTable('assignmentdetails', function(table) {
            table.integer('asgd_code').primary()

            table.integer('asgseqnum')
            table.integer('ailseqnum')
            table.foreign('asgseqnum').references('assignments.asg_seq_num')
            table.foreign('ailseqnum').references('agendaitemlegs.ailseqnum')


            table.string('latcode')
            table.string('todcode')
            table.string('orgcode')
            table.string('asgscode')
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