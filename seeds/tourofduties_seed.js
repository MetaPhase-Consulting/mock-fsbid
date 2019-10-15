const { readJson } = require('./data/helpers')

const tourofduties = readJson('./tourofduties.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('tourofduties').del()
    .then(function () {
      // Inserts seed entries
      return knex('tourofduties').insert(tourofduties);
    });
};
