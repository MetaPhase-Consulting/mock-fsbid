const { readJson, findRandom } = require('./data/helpers')

const positions = readJson('./positions.json')
const locations = readJson('./locations.json')
const orgs = readJson('./organizations')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees CASCADE')
    .then(function () {
      // Iterate positions to populate relationships
      const full_positions = positions.map(position => {
        position.pos_location_code = findRandom(locations)['location_code']
        position.org_code = findRandom(orgs)['code']
        return position

      })
      // Inserts seed entries
      return knex('positions').insert(full_positions);
    });
};
