const { readJson } = require('./data/helpers')

const remarks = readJson('./remarks.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE remarksinsertiontext CASCADE')
    .then(function () {
      let remarksInsertionTextArr = [];
      // Inserts seed entries
      remarks.forEach(r => {
        r.RemarkInserts.forEach(a => remarksInsertionTextArr.push(a));
      })
      return knex('remarksinsertiontext').insert(remarksInsertionTextArr);
    });
};
