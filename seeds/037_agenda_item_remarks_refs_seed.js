const { readJson } = require('./data/helpers')

const agenda_item_remarks_ref = readJson('./agenda_item_remarks_ref.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE agenda_item_remarks_ref CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('agenda_item_remarks_ref').insert(agenda_item_remarks_ref);
    });
};
