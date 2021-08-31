const { readJson } = require('./data/helpers')

const panelmeetingdates = readJson('./panelmeetingdates.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingdates CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('panelmeetingdates').insert(panelmeetingdates);
    });
};
