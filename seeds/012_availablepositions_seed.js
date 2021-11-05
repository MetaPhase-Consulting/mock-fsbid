const _ = require('lodash');
const dateFns = require('date-fns');
const { readJson } = require('./data/helpers')

const cycles = readJson('./cycles.json')
const positions = readJson('./positions')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE availablepositions CASCADE')
    .then(function () {
      // Inserts seed entries
      const availablepositions = []
      const flags = ["Y", "N", null];
      cycles.forEach(cycle => {
        positions.forEach(position => {
          availablepositions.push({
            cycle_id: cycle.cycle_id,
            cp_status: 'OP',
            cp_post_dt: dateFns.subDays(Date.now(), Math.floor(Math.random() * 100) + 1),
            cp_ted_ovrrd_dt: dateFns.addDays(Date.now(), Math.floor(Math.random() * 1000) + 100),
            position: position['position'],
            bt_consumable_allowance_flg: _.sample(flags),
            bt_service_needs_diff_flg: _.sample(flags),
            bt_most_difficult_to_staff_flg: _.sample(flags),
            bt_inside_efm_employment_flg: _.sample(flags),
            bt_outside_efm_employment_flg: _.sample(flags),
            acp_hard_to_fill_ind: _.sample(["Y", "N"]),
          })
        })
      });
      return knex('availablepositions').insert(availablepositions);
    });
};
