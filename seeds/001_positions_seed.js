const { readJson, findRandom } = require('./data/helpers')
const _ = require('lodash');

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
const tourofduties = readJson('./tourofduties.json')
const bureauskills = readJson('./bureau_skills.json')

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

        const jc_id = findRandom(codes)['jc_id']

        position.jc_id = jc_id;
        const odds = Math.random() * 100;
        // set jc_id_2 to the same as jc_id 50% of the time
        if (odds < 50) {
          position.jc_id_2= jc_id;
        } else {
          position.jc_id_2= findRandom(codes)['jc_id'];
        }

        // mock the consultative bureau based on either skill code
        position.consultative_bureau = _.get(
          bureauskills.find(f => f.jc_id === position.jc_id || f.jc_id === position.jc_id_2),
          'bur'
        )

        position.bt_differential_rate_num = findRandom(differentialrates)['pay_percent_num']
        position.bt_danger_pay_num = findRandom(dangerpays)['pay_percent_num']
        position.pos_job_category_desc = findRandom(jobcategories)['name']
        position.tod = findRandom(tourofduties)['todcode']

        return position

      })
      // Inserts seed entries
      return knex('positions').insert(full_positions);
    });
};
