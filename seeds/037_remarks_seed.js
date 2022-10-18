const { readJson } = require('./data/helpers')

const remarks = readJson('./remarks.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE remarks CASCADE')
    .then(function () {
      // Inserts seed entries
      remarks.forEach(r => delete(r.RemarkInserts));
      return knex('remarks').insert(remarks);
    });
};
