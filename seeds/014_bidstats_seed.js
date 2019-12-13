const { readJson } = require('./data/helpers')

const bidstats = readJson('./bidstats.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE bidstats CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('bidstats').insert(bidstats);
    });
};
