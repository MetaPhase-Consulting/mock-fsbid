const { readJson } = require('./data/helpers')

const languages = readJson('./languages.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE languages CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('languages').insert(languages);
    });
};
