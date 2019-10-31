const { readJson } = require('./data/helpers')

const bureaus = readJson('./seasons.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE seasons CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('seasons').insert(bureaus);
    });
};
