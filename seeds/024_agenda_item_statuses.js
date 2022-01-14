const { readJson } = require('./data/helpers')

const agenda_item_statuses = readJson('./agenda_item_statuses.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE agenda_item_statuses CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('agenda_item_statuses').insert(agenda_item_statuses);
    });
};
