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
  'organizations'
]
exports.seed = async function(knex) {
  return await lookups.forEach(lookup => {
     // Deletes ALL existing entries
    return knex.raw(`TRUNCATE TABLE ${lookup} CASCADE`)
    .then(function () {
      const data = readJson(`./${lookup}.json`)
      // Inserts seed entries
      return knex(lookup).insert(data);
    });
  })
  
};
