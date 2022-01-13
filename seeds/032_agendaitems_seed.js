const datefns = require('date-fns');
const { randomIntInclusive } = require('./data/helpers');
const _ = require('lodash');

const agendaitems = readJson('./agendaitems.json');
const tods = readJson('./tourofduties.json');

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE agendaitems CASCADE')
    .then(function () {
      return knex.select('aiscode').from('agendaitemstatuses')
        .then(AISs => {
          return knex.select('pmiseqnum').from('panelmeetingitems')
            .then(PMIs => {
              const agenda_items = [];
              PMIs.forEach(pmi => {
                let seed_ai = _.sample(agendaitems);
                let tod = _.sample(tods);

                seed_ai['pmiseqnum'] = pmi.pmiseqnum;
                seed_ai['aiscode'] = _.sample(AISs).aiscode;
                seed_ai['aiseqnumref'] = randomIntInclusive(100, 1000);

                // Jenny or Tarek
                if(i%2) {
                  seed_ai['empseqnbr'] = 143197;
                  seed_ai['perdetseqnum'] = 6;
                } else {
                  seed_ai['empseqnbr'] = 143195;
                  seed_ai['perdetseqnum'] = 4;
                }
                seed_ai['todcode'] = tod['code'];
                seed_ai['toddesctext'] = tod['long_desc'];
                seed_ai['aicombinedtodmonthsnum'] = randomIntInclusive(12, 72);
                seed_ai['aicreateid'] = pmi['pmicreateid'];
                seed_ai['aicreatedate'] = pmi['pmicreatedate'];
                seed_ai['aiupdateid'] = _.sample([2, 7, 8, 13]);
                seed_ai['aiupdatedate'] = datefns.addDays(pmi['pmicreatedate'], randomIntInclusive(14, 30));

                agenda_items.push(seed_ai);
              });
              return knex.batchInsert('agendaitems', agenda_items, 500);
            });
        });
    });
};
