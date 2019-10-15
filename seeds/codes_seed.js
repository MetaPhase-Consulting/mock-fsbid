const { readJson } = require('./data/helpers')

const codes = readJson('./codes.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('codes').del()
    .then(function () {
      // Inserts seed entries
      return knex('codes').insert(codes);
    });
};
