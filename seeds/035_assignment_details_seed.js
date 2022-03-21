const _ = require('lodash')
const { randomIntInclusive } = require('./data/helpers')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE assignmentdetails CASCADE')
    .then(function () {
      return knex.select().from('agendaitemlegs')
        .then(AILs => {
          return knex.select('pos_seq_num').from('positions')
            .then(Ps => {
              return knex.select().from('assignments')
                .then(ASGs => {
                  const assignment_details = [];
                  const yNnull = ['Y', 'N', null];
                  AILs.forEach(ail => {
                    const employeeAssignments = _.filter(ASGs, ['emp_seq_nbr', ail.empseqnbr]);
                    if (employeeAssignments) {
                      const empAsg = _.sample(employeeAssignments);
                      const position = _.find(Ps, ['pos_seq_num', empAsg['pos_seq_num']]);
                      assignment_details.push({
                        asgseqnum: empAsg['asg_seq_num'],
                        asgscode: empAsg['asgs_code'] || _.sample(['AP', 'BR', 'CP', 'EF']),
                        latcode: ail['latcode'],
                        todcode: ail['todcode'],
                        ailseqnum: ail['ailseqnum'],
                        orgcode: position['org_code'],
                        asgdrevisionnum: null,
                        asgdtodothertext: ail['ailtodothertext'],
                        asgdtodmonthsnum: ail['ailtodmonthsnum'],
                        asgdetadate: ail['ailetadate'],
                        asgdadjustmonthsnum: randomIntInclusive(0, 3),
                        asgdetdteddate: position['ted'],
                        asgdsalaryreimburseind:  _.sample(yNnull),
                        asgdtravelreimburseind:  _.sample(yNnull),
                        asgdtrainingind:  _.sample(yNnull),
                        asgdcreateid: null,
                        asgdcreatedate: empAsg['asg_create_date'],
                        asgdupdateid: null,
                        asgdupdatedate: position['last_updated_date'],
                        asgdnotecommenttext: '',
                        asgdpriorityind:  _.sample(yNnull),
                        asgdcriticalneedind:  _.sample(yNnull),
                      });
                    }
                  });
                  return knex.batchInsert('assignmentdetails', assignment_details, 500);
                });
            });
        });
    });
};