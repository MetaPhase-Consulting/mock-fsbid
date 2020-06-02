// commuterposts.json is a seed file based on actual fsbid response 
// const commuterposts = readJson('./commuterposts.json')
const { readJson } = require('./data/helpers')
const _ = require('lodash');

const locations = readJson('./locations')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE commuterposts CASCADE')
    .then(function () {
      const commuterposts = []
      const frequency = [
        "Weekends", 
        "Weekends (if no travel restrictions)", 
        "Daily", 
        "Weekly (Daily possible)"
      ]
      // Set 26 commuter posts to match fsbid number
      for (let i = 0; i < 26; i++) {
        const location_1 = _.sample(locations)
        const location_2 = _.sample(locations)
        const description = `${_.get(location_1, 'location_city')}/${_.get(location_2, 'location_city')}`
        commuterposts.push({
          cpn_desc: description,
          cpn_freq_desc: _.sample(frequency),
          location_code_1: _.get(location_1, "location_code"),
          location_code_2:_.get(location_2, "location_code")
        })
      }
      // Inserts seed entries
      return knex('commuterposts').insert(commuterposts);
    });
};