const { readJson } = require('./data/helpers')

const futurevacancies = readJson('./futurevacancies.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE futurevacancies CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('futurevacancies').insert(futurevacancies);
    });
};
