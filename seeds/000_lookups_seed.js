const { readJson } = require('./data/helpers')

const lookups = [
  'bureaus', 
  'codes', 
  'cycles', 
  'dangerpays', 
  'differentialrates', 
  'employees', 
  'grades', 
  'languages', 
  'seasons', 
  'tourofduties', 
  'organizations',
  "locations",
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
