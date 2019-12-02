const { readJson } = require('./data/helpers')

const employees_skills = readJson('./employees_skills.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees_skills CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('employees_skills').insert(employees_skills);
    });
};
