const { readJson } = require('./data/helpers')

const postindicators = readJson('./postindicators.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE postindicators CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('postindicators').insert(postindicators);
    });
};
