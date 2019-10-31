const { readJson } = require('./data/helpers')

const codes = readJson('./codes.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE codes CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('codes').insert(codes);
    });
};
