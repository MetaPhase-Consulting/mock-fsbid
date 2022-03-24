const { readJson } = require('./data/helpers')

const remark_categories = readJson('./remark_categories.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE remark_categories CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('remark_categories').insert(remark_categories);
    });
};
