const { readJson } = require('./data/helpers')

const panelmeetingitemcategories = readJson('./panelmeetingitemcategories.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingitemcategories CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('panelmeetingitemcategories').insert(panelmeetingitemcategories);
    });
};
