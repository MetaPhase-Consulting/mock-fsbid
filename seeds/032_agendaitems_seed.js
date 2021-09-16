const datefns = require('date-fns');
const { findRandom, randomIntInclusive } = require('./data/helpers')
const _ = require('lodash')

const agendaitems = readJson('./agendaitems.json')




exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE agendaitems CASCADE')
    .then(function () {
      return knex.select('aiscode').from('agendaitemstatuses')
        .then(aiscodes => {
          return knex.select('pmiseqnum').from('panelmeetingitems')
            .then(pmiseqnums => {
              const agenda_items = [];
              const yearFromNow = datefns.addDays(Date.now(), 365);
              for (let i = 0; i < 2000; i++) {
                let seed_ai = _.sample(agendaitems);

                seed_ai['aiseqnum'] = i + 1;
                seed_ai['aiscode'] = _.sample(aiscodes).aiscode;
                seed_ai['pmiseqnum'] = _.sample(pmiseqnums).pmiseqnum;

                seed_ai['aiseqnumref'] = null; //129 of 150 null otherwise 3-4 digit num
                if(i%2) {
                  seed_ai['aiseqnumref'] = randomIntInclusive(100, 1000);
                }
                seed_ai['aicreateid'] = randomIntInclusive(1, 100000);//1-6 digit nums
                seed_ai['aiupdateid'] = randomIntInclusive(1000, 10000);//4-6 digit nums

                const createDate = datefns.subDays(yearFromNow, randomIntInclusive(0, 4015));
                seed_ai['aicreatedate'] = createDate;//date from 10 years back to 1 year forward
                seed_ai['aiupdatedate'] = datefns.addDays(createDate, randomIntInclusive(14, 42)); //aicreatedate + (2 - 6 weeks)
                seed_ai['aiitemcreatorid'] = findRandom([7, 13]);

/*      waiting
                seed_ai['perdetseqnum'] = ;
                seed_ai['empseqnbr'] = ;
                seed_ai['asgseqnum'] = ;
                seed_ai['todcode'] = ;
                seed_ai['asgdrevisionnum'] = ;
                 */
                agenda_items.push(seed_ai);
              }
              return knex.batchInsert('agendaitems', agenda_items, 500);
            });
        });
    });
};
