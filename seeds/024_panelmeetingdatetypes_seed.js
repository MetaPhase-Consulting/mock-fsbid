const { readJson } = require('./data/helpers')

const panelmeetingdatetypes = readJson('./panelmeetingdatetypes.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingdatetypes CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('panelmeetingdatetypes').insert(panelmeetingdatetypes);
    });
};
