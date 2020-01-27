const { readJson } = require('./data/helpers')

const seasons = readJson('./seasons.json')
const positions = readJson('./positions')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE futurevacancies CASCADE')
    .then(function () {
      const futurevacancies = []
      seasons.forEach(season => {
        positions.forEach(position => {
          futurevacancies.push({
            bsn_id: season.bsn_id,
            bsn_descr_text: season.bsn_descr_text,
            fv_override_ted_date: knex.fn.now(),
            position: position['position']
          })
        })
      });
      return knex('futurevacancies').insert(futurevacancies);
    });
};
