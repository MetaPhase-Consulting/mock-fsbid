const { readJson } = require('./data/helpers')

const panelmeetingtypes = readJson('./panelmeetingtypes.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingtypes CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('panelmeetingtypes').insert(panelmeetingtypes);
    });
};
