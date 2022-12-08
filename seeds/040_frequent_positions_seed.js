const { readJson } = require('./data/helpers')
const _ = require("lodash");

const frequentpos = readJson('./frequentpositions.json')

exports.seed = function (knex) {
  return knex.raw('TRUNCATE TABLE frequentpositions CASCADE')
    .then(function () {
      return knex.select('pos_seq_num as posseqnum').from('positions').limit(10)
        .then(pos => {
          return knex('frequentpositions').insert(pos);
        });
    })
};
