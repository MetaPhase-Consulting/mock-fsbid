const { readJson } = require('./data/helpers')

const employees_organizations = readJson('./employees_organizations.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees_organizations CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('employees_organizations').insert(employees_organizations);
    });
};
