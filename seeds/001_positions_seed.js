const { readJson, findRandom } = require('./data/helpers')

const positions = readJson('./positions.json')
const locations = readJson('./locations.json')
const orgs = readJson('./organizations')
const languages = readJson('./languages.json')
const bureaus = readJson('./bureaus.json')
const grades = readJson('./grades.json')
const codes = readJson('./codes.json')
const differentialrates = readJson('./differentialrates.json')
const dangerpays = readJson('./dangerpays.json')
const jobcategories = readJson('./jobcategories.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees CASCADE')
    .then(function () {
      // Iterate positions to populate relationships
      const full_positions = positions.map(position => {
        position.pos_location_code = findRandom(locations)['location_code']
        position.org_code = findRandom(orgs)['code']
        position.lang1 = findRandom(languages)['language_code']
        position.lang2 = findRandom(languages)['language_code']
        position.bureau = findRandom(bureaus)['bur']
        position.pos_grade_code = findRandom(grades)['grade_code']
        position.jc_id = findRandom(codes)['jc_id']
        position.bt_differential_rate_num = findRandom(differentialrates)['pay_percent_num']
        position.bt_danger_pay_num = findRandom(dangerpays)['pay_percent_num']
        position.pos_job_category_desc = findRandom(jobcategories)['name']
        return position

      })
      // Inserts seed entries
      return knex('positions').insert(full_positions);
    });
};
