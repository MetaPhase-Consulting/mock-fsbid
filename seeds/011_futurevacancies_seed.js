const _ = require('lodash');
const { readJson } = require('./data/helpers')

const seasons = readJson('./seasons.json')
const positions = readJson('./positions')
const employees = readJson('./employees')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE futurevacancies CASCADE')
    .then(function () {
      const futurevacancies = []
      const flags = ["Y", "N", null];
      seasons.forEach(season => {
        positions.forEach(position => {
          futurevacancies.push({
            bsn_id: season.bsn_id,
            bsn_descr_text: season.bsn_descr_text,
            fv_override_ted_date: knex.fn.now(),
            position: position['position'],
            bt_consumable_allowance_flg: _.sample(flags),
            bt_service_needs_diff_flg: _.sample(flags),
            bt_most_difficult_to_staff_flg: _.sample(flags),
            bt_inside_efm_employment_flg: _.sample(flags),
            bt_outside_efm_employment_flg: _.sample(flags),
            assignee: Math.random() < .7 ? _.sample(employees).last_name : 'Vacant',
          })
        })
      });
      return knex('futurevacancies').insert(futurevacancies);
    });
};
