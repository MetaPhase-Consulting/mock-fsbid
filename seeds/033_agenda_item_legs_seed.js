const _ = require('lodash')
const datefns = require('date-fns');
const { randomIntInclusive } = require('./data/helpers')
const lats = readJson('./legactiontype.json')
const locations = readJson('./locations.json')
const tods = readJson('./tourofduties.json')
const positions = readJson('./positions.json')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE agendaitemlegs CASCADE')
    .then(function () {
      return knex.select('aiseqnum').from('agendaitems')
        .then(AIs => {
          return knex.select('cp_id').from('availablePositions')
            .then(APs => {
                const agenda_items_legs = [];
                let ailseqnum = 1;
                const today = Date.now();

                AIs.forEach(ai => {
                  const aiseqnum = ai.aiseqnum; // blocker until other Mock PR merges
                  const empseqnbr = ai.empseqnbr; // blocker until other Mock PR merges
                  const perdetseqnum = ai.perdetseqnum; // blocker until other Mock PR merges
                  // // 1-4 legs for most ai - 5-7 for aiseqnums ending in 7
                  const numOfLegs = _.endsWith(aiseqnum, 7) ? _.sample([5, 6, 7]) : _.sample([1, 2, 3, 4]);
                  // 10 years past - 1 year future
                  let etadate = datefns.addDays(today, randomIntInclusive(-3650, 365));

                  for(let k = 1; k <= numOfLegs; k++) {
                    const ap = _.sample(APs);
                    const lat = _.sample(lats);
                    const location = _.sample(locations);
                    const todmonthsnum = randomIntInclusive(1, 50);
                    const tedsepdate = datefns.addMonths(etadate, todmonthsnum);

                    agenda_items_legs.push({
                      ailseqnum: ailseqnum,
                      aiseqnum: aiseqnum,
                      latcode: lat.latcode,

                      cpid: ap.cp_id,
                      posseqnum: _.find(positions, ['position', ap.position])['pos_seq_num'],
                      empseqnbr: empseqnbr,
                      perdetseqnum: perdetseqnum,
                      todcode: tods.code,
                      ailtodmonthsnum: todmonthsnum,
                      ailtodothertext: tods['long_desc'],
                      ailetadate: etadate,
                      ailetdtedsepdate: tedsepdate,
                      ailcitytext: location.location_city,
                      ailcountrystatetext: location.location_state,
                      ailemprequestedsepind:  _.sample('Y', 'N', null),
                    });
                    ailseqnum+=1;
                    etadate = datefns.addMonths(tedsepdate, 1);
                  }
                });

                  return knex.batchInsert('agendaitemlegs', agenda_items_legs, 500);
            });
        });
    });
};