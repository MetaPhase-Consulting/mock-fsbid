const { readJson } = require('./data/helpers')
const legaction_types = readJson('./legactiontypes.json')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE legactiontypes CASCADE')
    .then(function () {
      return knex('legactiontypes').insert(legaction_types);
    });
};
