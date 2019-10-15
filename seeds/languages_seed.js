const { readJson } = require('./data/helpers')

const languages = readJson('./languages.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('languages').del()
    .then(function () {
      // Inserts seed entries
      return knex('languages').insert(languages);
    });
};
