const { readJson } = require('./data/helpers')

const employees_languages = readJson('./employees_languages.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees_languages CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('employees_languages').insert(employees_languages);
    });
};
