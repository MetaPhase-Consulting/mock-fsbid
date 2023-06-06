const _ = require('lodash')
const datefns = require('date-fns');
const { randomIntInclusive, readJson } = require('./data/helpers')
const lats = readJson('./legactiontypes.json')
const locations = readJson('./locations.json')
const tods = readJson('./tourofduties.json')
const positions = readJson('./positions.json')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE agendaitemlegs CASCADE')
    .then(function () {
      return knex.select().from('agendaitems')
        .then(AIs => {
          return knex.select('cp_id', 'position').from('availablepositions')
            .then(APs => {
                const agenda_items_legs = [];
                const today = Date.now();

              AIs.forEach(ai => {
                  const { aiseqnum, empseqnbr, perdetseqnum } = ai;
                  // // 1-4 legs for most ai - 5-7 for aiseqnums ending in 7
                  const numOfLegs = _.endsWith(aiseqnum, 7) ? _.sample([5, 6, 7]) : _.sample([0, 1, 2, 3, 4]);
                  // 10 years past - 1 year future
                  let etadate = datefns.addDays(today, randomIntInclusive(-3650, 365));

                  for(let k = 1; k <= numOfLegs; k++) {
                    const ap = _.sample(APs);
                    const lat = _.sample(lats);
                    const location = _.sample(locations);
                    const tod = _.sample(tods);
                    const todmonthsnum = randomIntInclusive(1, 50);
                    const tedsepdate = datefns.addMonths(etadate, todmonthsnum);

                    agenda_items_legs.push({
                      aiseqnum: aiseqnum,
                      latcode: lat.latcode,

                      cpid: ap.cp_id,
                      asgdrevisionnum: null,
                      posseqnum: _.find(positions, ['position', ap.position])['pos_seq_num'],
                      empseqnbr: empseqnbr,
                      perdetseqnum: perdetseqnum,
                      todcode: tod.code,
                      ailtodmonthsnum: todmonthsnum,
                      ailtodothertext: tod.code === 'X' ? 'OTHER/SHORT/DESC' : null,
                      ailetadate: etadate,
                      ailetdtedsepdate: tedsepdate,
                      ailcitytext: location.location_city,
                      ailcountrystatetext: location.location_state,
                      ailemprequestedsepind:  _.sample('Y', 'N', null),
                    });
                    etadate = datefns.addMonths(tedsepdate, 1);
                  }
                });

                  return knex.batchInsert('agendaitemlegs', agenda_items_legs, 500);
            });
        });
    });
};