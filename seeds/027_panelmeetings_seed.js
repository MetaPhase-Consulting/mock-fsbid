const _ = require('lodash')
const { readJson } = require('./data/helpers')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE panelmeetings CASCADE')
    .then(function () {

      return knex.select('pmscode').from('panelmeetingstatuses')
        .then(() => {
          return knex.select('pmtcode').from('panelmeetingtypes')
            .then(pmtcodes => {
              const panel_meetings = [];
              const arr = Array(700).fill(null);
              arr.forEach((panel, i) => {
                let pmscode$ = 'C';
                if (i > arr.length - 4) {
                  pmscode$ = 'O';
                } else if (i > arr.length / 2) {
                  pmscode$ = 'P';
                } else if (i > arr.length / 4) {
                  pmscode$ = _.sample(['I', 'A']);
                } 
                panel_meetings.push({
                  pmseqnum: i + 1,
                  pmscode: pmscode$,
                  pmtcode: _.sample(pmtcodes).pmtcode,
                  pmvirtualind: 'N',
                });
              });
              return knex.batchInsert('panelmeetings', panel_meetings, 500);
            });
        });
    });
};
