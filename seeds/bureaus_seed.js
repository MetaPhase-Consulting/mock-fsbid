const { readJson } = require('./data/helpers')

const bureaus = readJson('./bureaus.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('bureaus').del()
    .then(function () {
      // Inserts seed entries
      return knex('bureaus').insert(bureaus);
    });
};
