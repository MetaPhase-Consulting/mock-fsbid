const { readJson } = require('./data/helpers')

const dangerpays = readJson('./dangerpays.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('dangerpays').del()
    .then(function () {
      // Inserts seed entries
      return knex('dangerpays').insert(dangerpays);
    });
};
