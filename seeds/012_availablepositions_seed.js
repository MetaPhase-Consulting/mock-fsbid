const { readJson } = require('./data/helpers')

const availablepositions = readJson('./availablepositions.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE availablepositions CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('availablepositions').insert(availablepositions);
    });
};
