const { readJson } = require('./data/helpers')
const _ = require("lodash");

const frequentpos = readJson('./frequentpositions.json')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE frequentpositions CASCADE')
    .then(function () {
      const grades = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "MC", "OC", "OM"];
      const fp = [];
      frequentpos.forEach(freqP => {
        fp.push({
          ...freqP,
          posgradecode: _.sample(grades)
        })
      })
      return knex('frequentpositions').insert(fp);
    });
};
