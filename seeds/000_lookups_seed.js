const { readJson } = require('./data/helpers')

const lookups = [
  'unaccompaniedstatuses',
  'bureaus',
  'codes',
  'cycles',
  'dangerpays',
  'differentialrates',
  'grades',
  'languages',
  'seasons',
  'tourofduties',
  'toursofduty',
  'organizations',
  'locations',
  'roles',
  'classifications'
]
exports.seed = async function(knex) {
  // return lookups.forEach(lookup => {
  for (let index = 0; index < lookups.length; index++) {
    const lookup = lookups[index];
    // Deletes ALL existing entries
    await knex.raw(`TRUNCATE TABLE ${lookup} CASCADE`)
    const data = readJson(`./${lookup}.json`)
    // Inserts seed entries
    await knex(lookup).insert(data);
  };
};
