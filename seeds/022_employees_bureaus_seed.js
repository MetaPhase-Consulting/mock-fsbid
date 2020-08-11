const { readJson } = require('./data/helpers')

const employees_bureaus = readJson('./employees_bureaus.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees_bureaus CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('employees_bureaus').insert(employees_bureaus);
    });
};
