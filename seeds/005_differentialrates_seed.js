const { readJson } = require('./data/helpers')

const differentialrates = readJson('./differentialrates.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE differentialrates CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('differentialrates').insert(differentialrates);
    });
};
