const { readJson } = require('./data/helpers')

const cycles = readJson('./cycles.json')
const positions = readJson('./positions')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE availablepositions CASCADE')
    .then(function () {
      // Inserts seed entries
      const availablepositions = []
      cycles.forEach(cycle => {
        positions.forEach(position => {
          availablepositions.push({
            cycle_id: cycle.cycle_id,
            cp_status: 'OP',
            cp_post_dt: knex.fn.now(),
            cp_ted_ovrrd_dt: knex.fn.now(),
            position: position['position']
          })
        })
      });
      return knex('availablepositions').insert(availablepositions);
    });
};
