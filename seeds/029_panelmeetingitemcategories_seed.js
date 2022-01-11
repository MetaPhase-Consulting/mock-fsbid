const { readJson } = require('./data/helpers')

const panelmeetingitemcategories = readJson('./panelmeetingitemcategories.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingitemcategories CASCADE')
    .then(function () {
      // TODO: seed the following
      // "miccreateid": 2,
      //    "miccreatedate": "2004-05-05T00:00:00",
      //     "micupdateid": 2,
      //     "micupdatedate": "2004-05-05T00:00:00"


      // Inserts seed entries
      return knex('panelmeetingitemcategories').insert(panelmeetingitemcategories);
    });
};
