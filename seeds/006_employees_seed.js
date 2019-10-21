const { readJson } = require('./data/helpers')

const employees = readJson('./employees.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('employees').insert(employees);
    });
};
