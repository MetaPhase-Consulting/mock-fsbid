const { readJson } = require('./data/helpers')

const legactiontypes = readJson('./legactiontypes.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE legactiontype CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('legactiontype').insert(legactiontypes);
    });
};
