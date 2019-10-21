const { readJson } = require('./data/helpers')

const dangerpays = readJson('./dangerpays.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE dangerpays CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('dangerpays').insert(dangerpays);
    });
};
