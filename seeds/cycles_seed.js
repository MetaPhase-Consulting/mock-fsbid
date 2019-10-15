const { readJson } = require('./data/helpers')

const cycles = readJson('./cycles.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('cycles').del()
    .then(function () {
      // Inserts seed entries
      return knex('cycles').insert(cycles);
    });
};
