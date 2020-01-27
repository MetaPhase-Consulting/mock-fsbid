const { readJson } = require('./data/helpers')

const capsuledescriptions = readJson('./capsuledescriptions.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE capsuledescriptions CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('capsuledescriptions').insert(capsuledescriptions);
    });
};
