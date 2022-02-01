const datefns = require('date-fns');
const { randomIntInclusive, readJson } = require('./data/helpers');
const _ = require('lodash');

const agendaitems = readJson('./agendaitems.json');
const tods = readJson('./tourofduties.json');

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE agendaitems CASCADE')
    .then(function () {
      return knex.select('aiscode').from('agenda_item_statuses')
        .then(AISs => {
          return knex.select().from('panelmeetingitems')
            .then(PMIs => {
              return knex.select('perdet_seq_num', 'per_seq_num').from('employees')
                .then(EMPs => {
                  const agenda_items = [];
                  PMIs.forEach(pmi => {
                    let seed_ai = {};
                    let tod = _.sample(tods);
                    let emp = _.sample(EMPs);
                    seed_ai['pmiseqnum'] = pmi.pmiseqnum;
                    seed_ai['aiscode'] = _.sample(AISs).aiscode;
                    seed_ai['empseqnbr'] = emp.per_seq_num;
                    seed_ai['perdetseqnum'] = emp.perdet_seq_num;
                    seed_ai['todcode'] = tod['code'];
                    seed_ai['toddesctext'] = tod['long_desc'];
                    seed_ai['aicombinedtodmonthsnum'] = randomIntInclusive(12, 72);
                    seed_ai['aicombinedtodothertext'] = _.sample(agendaitems['aicombinedtodothertext']);
                    seed_ai['aicorrectiontext'] = null;
                    seed_ai['ailabeltext'] = _.sample(agendaitems['ailabeltext']);
                    seed_ai['aicreateid'] = pmi['pmicreateid'];
                    seed_ai['aicreatedate'] = pmi['pmicreatedate'];
                    seed_ai['aiupdateid'] = _.sample([2, 7, 8, 13]);
                    seed_ai['aiupdatedate'] = datefns.addDays(pmi['pmicreatedate'], randomIntInclusive(14, 30));
                    seed_ai['aiseqnumref'] = randomIntInclusive(100, 1000);
                    seed_ai['aiitemcreatorid'] = _.sample([2, 7, 8, 13]);
                    agenda_items.push(seed_ai);
                  });
                  console.log("|\\---/|");
                  console.log("| o_o |");
                  console.log(" \\_^_/");
                  console.log(agenda_items);
                  return knex.batchInsert('agendaitems', agenda_items, 500);
              });
            });
        });
    });
};
