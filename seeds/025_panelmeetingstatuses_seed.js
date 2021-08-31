const { readJson } = require('./data/helpers')

const panelmeetingstatuses = readJson('./panelmeetingstatuses.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingstatuses CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('panelmeetingstatuses').insert(panelmeetingstatuses);
    });
};
