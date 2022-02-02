const { randomIntInclusive, readJson } = require('./data/helpers')
const _ = require('lodash')

const airremarks = readJson('./agenda_item_remarks.json')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE agendaitemremarks CASCADE')
    .then(function () {
      return knex.select('aiseqnum').from('agendaitems')
        .then(AIs => {
          const agenda_item_remarks = [];

          AIs.forEach(ai => {
            const { aiseqnum } = ai;
            const numOfRemarks = randomIntInclusive(0, 10)

            for(let k = 0; k < numOfRemarks; k++) {
              agenda_item_remarks.push({
                aiseqnum: aiseqnum,
                airremarktext: _.sample(airremarks),
                aircompleteind: _.sample('Y', 'N', null),
              });
            }
          });
          return knex.batchInsert('agendaitemremarks', agenda_item_remarks, 500);
      });
    });
};
