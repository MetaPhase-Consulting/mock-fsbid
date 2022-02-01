const { readJson } = require('./data/helpers')
const datefns = require('date-fns')
const { randomIntInclusive } = require('./data/helpers')

const panelmeetingitemcategories = readJson('./panelmeetingitemcategories.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingitemcategories CASCADE')
    .then(function () {
      const panel_meeting_item_categories = [];
      const createDate = datefns.subDays(Date.now(), randomIntInclusive(250, 365));
      panelmeetingitemcategories.forEach(mic => {
        panel_meeting_item_categories.push({
          miccreateid: 2,
          miccreatedate: createDate,
          micupdateid: 2,
          micupdatedate: datefns.addDays(createDate, randomIntInclusive(10, 60)),
        });
      });

      return knex('panelmeetingitemcategories').insert(panelmeetingitemcategories);
    });
};
