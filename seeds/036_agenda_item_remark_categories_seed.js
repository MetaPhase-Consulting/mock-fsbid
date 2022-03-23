const { readJson } = require('./data/helpers')

const agenda_item_remark_categories = readJson('./agenda_item_remark_categories.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE agenda_item_remark_categories CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('agenda_item_remark_categories').insert(agenda_item_remark_categories);
    });
};
