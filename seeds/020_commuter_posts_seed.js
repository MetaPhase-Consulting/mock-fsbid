const { readJson } = require('./data/helpers')

const commuterposts = readJson('./commuterposts.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE commuterposts CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('commuterposts').insert(commuterposts);
    });
};