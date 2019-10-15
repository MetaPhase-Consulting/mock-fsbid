const { readJson } = require('./data/helpers')

const bureaus = readJson('./seasons.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('seasons').del()
    .then(function () {
      // Inserts seed entries
      return knex('seasons').insert(bureaus);
    });
};
