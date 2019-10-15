const { readJson } = require('./data/helpers')

const differentialrates = readJson('./differentialrates.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('differentialrates').del()
    .then(function () {
      // Inserts seed entries
      return knex('differentialrates').insert(differentialrates);
    });
};
