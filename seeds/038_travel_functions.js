const { readJson } = require('./data/helpers')
const travel_functions = readJson('./travelfunctions.json')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE travelfunctions CASCADE')
    .then(function () {
      return knex('travelfunctions').insert(travel_functions);
    });
};
