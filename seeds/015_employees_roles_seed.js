const { readJson } = require('./data/helpers')

const employees_roles = readJson('./employees_roles.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees_roles CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('employees_roles').insert(employees_roles);
    });
};
