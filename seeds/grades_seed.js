const { readJson } = require('./data/helpers')

const grades = readJson('./grades.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('grades').del()
    .then(function () {
      // Inserts seed entries
      return knex('grades').insert(grades);
    });
};
